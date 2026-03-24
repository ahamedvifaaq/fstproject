
import Lesson from './Lesson';
import Createlesson from './createlesson';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import Audio from './Audio';
import Player from './audioplayer';

import Modules from './pages/Modules';
function App() {

  return (
    <>
    
{/*<Lesson></Lesson> */}
{/* <Audio></Audio> */}
{/* <Player></Player> */}
    
      <Routes>
         <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Createlesson />} />
        <Route path="/lesson/:lessonID/:mtitle" element={< Lesson/>} />
         <Route path="/courses" element={<Courses />} />
          <Route path="/course/:courseId/modules" element={<Modules />} />
          <Route path="/createlesson" element={<Createlesson />} />
      </Routes>
    
  
        

   
      </>
  )
}

export default App
