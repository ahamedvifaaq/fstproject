
import Lesson from './Lesson';
import Createlesson from './createlesson';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Courses from './pages/Courses';
import Modules from './pages/Modules';
function App() {

  return (
    <>
    
{/*<Lesson></Lesson> */}
    
      <Routes>
       
        <Route path="/" element={<Createlesson />} />
        <Route path="/Home" element={< Lesson/>} />
         <Route path="/courses" element={<Courses />} />
          <Route path="/course/:courseId/modules" element={<Modules />} />
      </Routes>
    
  
        

   
      </>
  )
}

export default App
