import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Addcourse.css";
 export default function AddCourse() {
    const navigate = useNavigate();
    const { id: insid } = useParams();
    const [form, setForm] = useState({
        title: "",
        description: "",
        difficulty: "beginner",
        price: "",
        tags: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!form.title || !form.price) {
            alert("Title and price are required");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/createcourse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`

                },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    difficulty: form.difficulty,
                    price: parseFloat(form.price),
                    tags: form.tags.split(",").map(tag => tag.trim()),
                    instructorId: insid
                })
            });

            const data = await res.json();
            if (res.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      throw new Error("Unauthorized");
    }

            if (!res.ok) throw new Error(data.message);

            alert("Course added successfully!");
            navigate("/courses");
        } catch (err) {
            console.error(err);
            alert("Failed to add course");
        }
    };

    return (
        <div className="addcourse">
            

            <form onSubmit={handleSubmit}

                style={{ display: "flex", flexDirection: "column", gap: 20, width: "400px", margin: "0 auto" }}>
               <h1>Add Course Page</h1>
                <input name="title" placeholder="Title" onChange={handleChange} />
                <textarea name="description" placeholder="Description" onChange={handleChange} />

                <select name="difficulty" onChange={handleChange}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>

                <input name="price" type="number" placeholder="Price" onChange={handleChange} />
                <input name="tags" placeholder="tag1, tag2" onChange={handleChange} />

                <button type="submit" >
                    Add Course
                </button>
            </form>
        </div>
    );
}