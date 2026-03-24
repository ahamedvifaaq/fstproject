export default function ProfileHeader({ user, onEdit, onPassword }) {
  return (
    <div className="profile-header">
      <img src={user.avatarUrl || "https://via.placeholder.com/100"} />

      <div className="profile-info">
        <h2>{user.username}</h2>
        <p>{user.bio || "No bio added"}</p>
        <p>{user.email}</p>
        <p>{user.role}</p>
        <p>Joined: {new Date(user.createdAt).toDateString()}</p>

        <div className="profile-actions">
          <button className="edit-btn" onClick={onEdit}>
            Edit Profile
          </button>

          <button className="password-btn" onClick={onPassword}>
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}