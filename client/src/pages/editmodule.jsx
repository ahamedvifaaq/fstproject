import React from 'react'
import './editmodule.css';

export default function editmodule() {
    function handleSubmit(e) {
        e.preventDefault();
    
    }


  return (
    <div className='editmodule'>
        <h1>Edit Module</h1>
        <form className='editmodule-form'>
            <input name="title" placeholder="Module Title" />
            <textarea name="description" placeholder="Module Description"></textarea>
            <button type="submit" onClick={handleSubmit}>
                Save Changes
            </button>
        </form>
    </div>
  )
}


