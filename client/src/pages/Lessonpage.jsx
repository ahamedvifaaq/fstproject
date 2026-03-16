import React from "react";
import { useParams } from "react-router-dom";

export default function LessonPage(){
    const {lessonId} =useParams();

    return(
        <div>
            <h1>Lesson page </h1>
            <p>Lesson id: {lessonId}</p>
        </div>
    )
}