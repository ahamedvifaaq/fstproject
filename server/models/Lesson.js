import mongoose from 'mongoose';

// Each "frame" in the video-like timeline
const timelineEventSchema = new mongoose.Schema({
    timestamp: { type: Number, required: true },      // seconds from start
    codeSnapshot: { type: String },      // full editor content at this point
    explanationText: { type: String, default: '' },         // instructor note / subtitle
    highlightLines: [{ type: Number }],                    // lines to visually highlight
    editable: { type: Boolean, default: false },     // can student edit at this point?
    cursor: {                                               // instructor cursor position
        lineNumber: { type: Number, default: 1 },
        column: { type: Number, default: 1 }
    }
}, { _id: false });

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    videoLength: { type: Number, default: 0 },              // total duration in seconds
    language: { type: String, default: 'javascript' },   // code language (js, python, etc.)
    audioUrl: { type: String, default: null },            // URL to recorded voiceover

    timeline: [timelineEventSchema]                      // the "video frames"
}, {
    timestamps: true
});

export default mongoose.model('Lesson', lessonSchema);
