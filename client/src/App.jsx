
import Lesson from './Lesson';
import Createlesson from './createlesson';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {

  return (
    <>
    
{/*<Lesson></Lesson> */}
    
      <Routes>
         <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Createlesson />} />
        <Route path="/Lesson" element={< Lesson/>} />
         <Route path="/courses" element={<Courses />} />
      </Routes>
    
  
        

   
      </>
  )
}

export default App
