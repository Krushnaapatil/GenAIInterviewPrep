import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const LogoutButton = ({ className = "", label = "Logout" }) => {
    const { handleLogout, loading } = useAuth();
    const navigate = useNavigate();

    const onLogout = async () => {
        await handleLogout();
        navigate("/login", { replace: true });
    };

    return (
        <button
            type="button"
            className={`button primary-button ${className}`.trim()}
            onClick={onLogout}
            disabled={loading}
        >
            {loading ? "Logging out..." : label}
        </button>
    );
};

export default LogoutButton;
