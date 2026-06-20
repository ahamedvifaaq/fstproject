import React,{useState,useEffect,useMemo} from "react";
import './Courses.css';
import Sidebar from "../components/sidebar";
import { useNavigate} from "react-router-dom";
export default function Courses() {
    const [showSidebar,setShowSidebar]=useState(false);
    const [courses, setCourses] = useState([]);
    const [instructorStatus, setInstructorStatus] = useState(localStorage.getItem("instructorStatus") || "");

    // Search & filter state
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("all");
    const [price, setPrice] = useState("all");
    const [sortBy, setSortBy] = useState("popular");

    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        fetch(`http://localhost:5000/api/courses`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
    if (res.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      throw new Error("Unauthorized");
    }
    return res.json();
  })
        .then(data =>{
            console.log(data.courses);
            setCourses(data.courses);
            localStorage.setItem("role",data.role);
            if (data.instructorStatus !== undefined) {
                localStorage.setItem("instructorStatus", data.instructorStatus || "");
                setInstructorStatus(data.instructorStatus || "");
            }
        })
        .catch(error => console.error("Error fetching courses:", error));
    }, []);
    const startCourse = (courseId) => {

        console.log("Starting course with ID:", courseId);
        navigate(`/course/${courseId}/modules`);

        // Implement the logic to start the course, e.g., navigate to the course page


    }

    // Most registered (popular) courses — top 4 by enrollment
    const popularCourses = useMemo(() => {
        return [...courses]
            .filter(c => (c.studentsEnrolled || 0) > 0)
            .sort((a, b) => (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0))
            .slice(0, 4);
    }, [courses]);

    // Apply search + filters + sort
    const filteredCourses = useMemo(() => {
        const term = search.trim().toLowerCase();
        let result = courses.filter(c => {
            const matchesSearch = !term
                || c.title?.toLowerCase().includes(term)
                || c.description?.toLowerCase().includes(term)
                || c.instructorName?.toLowerCase().includes(term)
                || (Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(term)));

            const matchesDifficulty = difficulty === "all" || (c.difficulty || "beginner") === difficulty;

            const matchesPrice = price === "all"
                || (price === "free" && (c.price || 0) === 0)
                || (price === "paid" && (c.price || 0) > 0);

            return matchesSearch && matchesDifficulty && matchesPrice;
        });

        result.sort((a, b) => {
            switch (sortBy) {
                case "popular": return (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0);
                case "rating": return (b.averageRating || 0) - (a.averageRating || 0);
                case "priceLow": return (a.price || 0) - (b.price || 0);
                case "priceHigh": return (b.price || 0) - (a.price || 0);
                case "newest": return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                default: return 0;
            }
        });
        return result;
    }, [courses, search, difficulty, price, sortBy]);

    const isFiltering = search.trim() !== "" || difficulty !== "all" || price !== "all";

    const renderCard = (course) => (
        <div key={course._id} className="course-card">
            <div className="course-image-container">
                {/* Use placeholder image if none exists */}
                <img src={course.imageUrl || "/assets/course-placeholder.png"} alt={course.title} />
                <span className={`difficulty-badge ${course.difficulty || 'beginner'}`}>
                    {course.difficulty || 'beginner'}
                </span>
            </div>

            <div className="content">
                <h2>{course.title}</h2>

                <div className="course-meta">
                    <span className="instructor-name">
                        👤 {course.instructorName || "Unknown"}
                    </span>
                    <span className="course-rating">
                        {course.reviewCount > 0 ? (
                            <>
                                <span className="rating-stars">
                                    {"★".repeat(Math.round(course.averageRating))}
                                    {"☆".repeat(5 - Math.round(course.averageRating))}
                                </span>
                                <span className="rating-value">
                                    {course.averageRating.toFixed(1)} ({course.reviewCount})
                                </span>
                            </>
                        ) : (
                            <span className="no-rating">No ratings yet</span>
                        )}
                    </span>
                </div>

                <p className="enrolled-count">🎓 {course.studentsEnrolled || 0} enrolled</p>

                <p className="description">{course.description || "No description provided."}</p>

                <div className="card-footer">
                    <span className={`price ${course.price === 0 ? 'free' : ''}`}>
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                    </span>
                    <button className="btn-start" onClick={()=>startCourse(course._id)}>
                        Start Learning -&gt;
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="courses-page">
             <Sidebar title={"All Courses"} styles={"red"} />

             <div className="courses-container">
                 <div className="createcourse">
                     <h1>Explore Courses</h1>
                     {localStorage.getItem("role")==="instructor" && (
                         instructorStatus === "approved" ? (
                             <button className="btn-primary" type="button" onClick={() => navigate(`/addcourse/${localStorage.getItem("userId")}`)}>
                                 + Create New Course
                             </button>
                         ) : (
                             <span className={`instructor-status-notice ${instructorStatus || "pending"}`}>
                                 {instructorStatus === "rejected"
                                     ? "❌ Your instructor account was not approved"
                                     : "⏳ Awaiting admin approval to create courses"}
                             </span>
                         )
                     )}
                 </div>

                 {/* 🔥 Most Popular Courses — hidden while searching/filtering */}
                 {!isFiltering && popularCourses.length > 0 && (
                     <div className="popular-section">
                         <h2 className="section-heading">🔥 Most Popular Courses</h2>
                         <div className="courses-grid">
                             {popularCourses.map(renderCard)}
                         </div>
                     </div>
                 )}

                 {/* Search & filter bar */}
                 <div className="filter-bar">
                     <input
                         type="text"
                         className="search-input"
                         placeholder="🔍 Search courses, tags, instructors..."
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                     />
                     <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                         <option value="all">All Levels</option>
                         <option value="beginner">Beginner</option>
                         <option value="intermediate">Intermediate</option>
                         <option value="advanced">Advanced</option>
                     </select>
                     <select value={price} onChange={(e) => setPrice(e.target.value)}>
                         <option value="all">All Prices</option>
                         <option value="free">Free</option>
                         <option value="paid">Paid</option>
                     </select>
                     <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                         <option value="popular">Most Popular</option>
                         <option value="rating">Top Rated</option>
                         <option value="newest">Newest</option>
                         <option value="priceLow">Price: Low to High</option>
                         <option value="priceHigh">Price: High to Low</option>
                     </select>
                 </div>

                 <h2 className="section-heading">
                     {isFiltering ? `Results (${filteredCourses.length})` : "All Courses"}
                 </h2>

                 {filteredCourses.length === 0 ? (
                     <p className="no-results">No courses match your search.</p>
                 ) : (
                     <div className="courses-grid">
                         {filteredCourses.map(renderCard)}
                     </div>
                 )}
             </div>
        </div>
    );
}
