import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerAPI } from "../../services/authService";
import { Button } from "../../components/common/Button.jsx";

export const Register = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "student"
    });

    const [isLoading, setIsLoading] = useState(false);

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            await registerAPI(form);
            setSuccess("Registration successful. Redirecting to login page...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            setError(err.message);
            console.log("Registration Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl w-full max-w-[95%] sm:max-w-md">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Sign Up for the portal</h2>

                {success && <div className="bg-green-100 text-green-700 p-2 sm:p-2.5 mb-2 rounded-lg text-xs sm:text-sm">{success}</div>}
                {error && <div className="bg-red-50 text-red-600 p-2.5 sm:p-3 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base transition-shadow"
                            name="name"
                            placeholder="Enter Your Name"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base transition-shadow"
                            name="email"
                            placeholder="Enter Your Email"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base transition-shadow"
                            name="password"
                            placeholder="Enter Your Password"
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select name="role" onChange={handleChange} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm sm:text-base">
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>

                    <Button type="submit" className="w-full py-2.5 sm:py-3" isLoading={isLoading}>Sign Up</Button>
                </form>


                <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500">
                    <p>
                        Already have an account? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
