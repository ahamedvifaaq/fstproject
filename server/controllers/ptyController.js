import pty from "node-pty";
import fs from "fs";
import path from "path";
import os from "os";

export const setupPtySocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New PTY socket connection:", socket.id);
    let ptyProcess = null;

    socket.on("run_code", ({ code, language }) => {
      // Cleanup existing process. Mark it "replaced" so its exit event doesn't
      // get attributed to the new run (which would corrupt the run-history output).
      if (ptyProcess) {
        ptyProcess.replaced = true;
        ptyProcess.kill();
        ptyProcess = null;
      }

      // 1. Prepare temp file
      const sessionId = Math.random().toString(36).substring(7);
      const tmpDir = os.tmpdir();
      let cmd = "";
      let args = [];
      let tempFilePath = "";
      let exeFilePath = "";

      try {
        const isWin = os.platform() === "win32";

        if (language === "python" || language === "python3") {
          tempFilePath = path.join(tmpDir, `script_${sessionId}.py`);
          fs.writeFileSync(tempFilePath, code);
          cmd = isWin ? "cmd.exe" : "python";
          args = isWin ? ["/c", "python", "-u", tempFilePath] : ["-u", tempFilePath];
        } else if (language === "javascript" || language === "node") {
          tempFilePath = path.join(tmpDir, `script_${sessionId}.js`);
          fs.writeFileSync(tempFilePath, code);
          cmd = isWin ? "cmd.exe" : "node";
          args = isWin ? ["/c", "node", tempFilePath] : [tempFilePath];
        } else if (language === "java") {
          tempFilePath = path.join(tmpDir, `Main_${sessionId}.java`);
          fs.writeFileSync(tempFilePath, code);
          cmd = isWin ? "cmd.exe" : "java";
          args = isWin ? ["/c", "java", tempFilePath] : [tempFilePath];
        } else if (language === "cpp" || language === "c++" || language === "c") {
          tempFilePath = path.join(tmpDir, `script_${sessionId}.${language === "c" ? "c" : "cpp"}`);
          exeFilePath = path.join(tmpDir, `script_${sessionId}${isWin ? ".exe" : ""}`);
          fs.writeFileSync(tempFilePath, code);
          cmd = isWin ? "cmd.exe" : "sh";
          args = isWin 
            ? ["/c", `g++ ${tempFilePath} -o ${exeFilePath} && ${exeFilePath}`] 
            : ["-c", `g++ "${tempFilePath}" -o "${exeFilePath}" && "${exeFilePath}"`];
        } else {
          socket.emit("output", `Unsupported interactive language: ${language}\r\n`);
          return;
        }

        // 2. Spawn PTY
        const proc = pty.spawn(cmd, args, {
          name: "xterm-color",
          cols: 80,
          rows: 24,
          cwd: tmpDir,
          env: process.env,
        });
        ptyProcess = proc;

        // 3. Pipe PTY data to client (only while this is the active process)
        proc.on("data", (data) => {
          if (!proc.replaced) socket.emit("output", data);
        });

        proc.on("exit", (exitCode) => {
          // Always clean up temp files
          if (tempFilePath && fs.existsSync(tempFilePath)) {
             try { fs.unlinkSync(tempFilePath); } catch(e){}
          }
          if (exeFilePath && fs.existsSync(exeFilePath)) {
             try { fs.unlinkSync(exeFilePath); } catch(e){}
          }

          // If this process was killed to start a newer run, stay quiet so its
          // exit doesn't get logged as the new run's result.
          if (proc.replaced) return;

          socket.emit("output", `\r\n\x1b[33m--- Process exited with code ${exitCode} ---\x1b[0m\r\n`);
          socket.emit("run_exit", exitCode); // lets the client finalize a run-history entry
          if (ptyProcess === proc) ptyProcess = null;
        });

      } catch (err) {
        socket.emit("output", `\r\nError starting process: ${err.message}\r\n`);
      }
    });

    socket.on("input", (data) => {
      if (ptyProcess) {
        ptyProcess.write(data);
      }
    });

    socket.on("disconnect", () => {
      if (ptyProcess) {
        ptyProcess.kill();
        ptyProcess = null;
      }
    });
  });
};
