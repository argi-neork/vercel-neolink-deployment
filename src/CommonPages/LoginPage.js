import React, { useState } from 'react';
import loginImage from '../images/login-4.jpg';
import { useNavigate } from 'react-router-dom';
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const fillCredentials = (userEmail, userPassword) => {
        setEmail(userEmail);
        setPassword(userPassword);
    };

    const handleSubmit = () => {
        // Demo authentication
        if ((email === 'admin@gmail.com' && password === 'admin123') ||
            (email === 'user@gmail.com' && password === 'user123')) {

            const userType = email.includes('admin') ? 'Admin' : 'User';
            alert(`Login successful! Welcome ${userType}!`);

            // Here you would typically redirect to the dashboard
            // navigate('/dashboard');
            if (userType === 'Admin') {
                navigate('/home');
            } else {
                navigate('/home');
            }
        } else {
            alert('Invalid credentials! Please use the demo credentials provided.');
        }
    };

    return (
        <div className="container-fluid" style={{ minHeight: '100vh' }}>
            <div className="row" style={{ minHeight: '100vh' }}>
                {/* Left Side - Image */}
                <div className="col-lg-6 col-md-6 d-none d-md-block p-0">
                    <div
                        style={{
                            backgroundImage: `url(${loginImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            minHeight: '100vh',
                            position: 'relative'
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.3)'
                            }}
                        />
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="col-lg-6 col-md-6 col-12">
                    <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                            background: 'white',
                            minHeight: '100vh',
                            padding: '2rem'
                        }}
                    >
                        <div style={{ width: '100%', maxWidth: '400px' }}>
                            <h1
                                className="text-center mb-4"
                                style={{
                                    color: '#2c3e50',
                                    fontSize: '1.8rem',
                                    fontWeight: '600'
                                }}
                            >
                                NeoLink Enrollment System
                            </h1>

                            <div>
                                <div className="mb-3">
                                    <label
                                        htmlFor="email"
                                        className="form-label"
                                        style={{
                                            color: '#495057',
                                            fontWeight: '500',
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        placeholder="Email or Username"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{
                                            border: '1px solid #dee2e6',
                                            borderRadius: '0.375rem',
                                            padding: '0.75rem',
                                            fontSize: '1rem',
                                            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#4ecdc4';
                                            e.target.style.boxShadow = '0 0 0 0.2rem rgba(78, 205, 196, 0.25)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#dee2e6';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label
                                        htmlFor="password"
                                        className="form-label"
                                        style={{
                                            color: '#495057',
                                            fontWeight: '500',
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        Password
                                    </label>
                                    <div className="position-relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control"
                                            id="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            style={{
                                                border: '1px solid #dee2e6',
                                                borderRadius: '0.375rem',
                                                padding: '0.75rem',
                                                fontSize: '1rem',
                                                paddingRight: '45px',
                                                transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#4ecdc4';
                                                e.target.style.boxShadow = '0 0 0 0.2rem rgba(78, 205, 196, 0.25)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#dee2e6';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={togglePassword}
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'none',
                                                border: 'none',
                                                color: '#6c757d',
                                                cursor: 'pointer',
                                                padding: '0.25rem'
                                            }}
                                            onMouseOver={(e) => e.target.style.color = '#495057'}
                                            onMouseOut={(e) => e.target.style.color = '#6c757d'}
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-3 text-end">
                                    <a
                                        href="#"
                                        style={{
                                            color: '#4ecdc4',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.color = '#45b7aa';
                                            e.target.style.textDecoration = 'underline';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.color = '#4ecdc4';
                                            e.target.style.textDecoration = 'none';
                                        }}
                                    >
                                        Forgot Password ?
                                    </a>
                                </div>

                                <button
                                    type="button"
                                    className="btn w-100"
                                    onClick={handleSubmit}
                                    style={{
                                        backgroundColor: '#4ecdc4',
                                        borderColor: '#4ecdc4',
                                        color: 'white',
                                        fontWeight: '600',
                                        padding: '0.75rem',
                                        borderRadius: '0.375rem',
                                        transition: 'all 0.15s ease-in-out'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#45b7aa';
                                        e.target.style.borderColor = '#45b7aa';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = '#4ecdc4';
                                        e.target.style.borderColor = '#4ecdc4';
                                    }}
                                >
                                    Sign In
                                </button>
                            </div>

                            {/* Demo Credentials Section */}
                            <div
                                style={{
                                    marginTop: '2rem',
                                    padding: '1rem',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '0.375rem',
                                    borderLeft: '4px solid #4ecdc4'
                                }}
                            >
                                <div
                                    style={{
                                        color: '#2c3e50',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        marginBottom: '0.5rem'
                                    }}
                                >
                                    Demo Credentials
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem',
                                        padding: '0.25rem 0'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: '#6c757d',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Admin Email:
                                    </span>
                                    <span
                                        onClick={() => fillCredentials('admin@gmail.com', 'admin123')}
                                        style={{
                                            color: '#495057',
                                            fontSize: '0.85rem',
                                            fontFamily: 'monospace',
                                            backgroundColor: '#e9ecef',
                                            padding: '0.2rem 0.4rem',
                                            borderRadius: '0.25rem',
                                            cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#dee2e6'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#e9ecef'}
                                        title="Click to use"
                                    >
                                        admin@gmail.com
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem',
                                        padding: '0.25rem 0'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: '#6c757d',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Admin Password:
                                    </span>
                                    <span
                                        onClick={() => fillCredentials('admin@gmail.com', 'admin123')}
                                        style={{
                                            color: '#495057',
                                            fontSize: '0.85rem',
                                            fontFamily: 'monospace',
                                            backgroundColor: '#e9ecef',
                                            padding: '0.2rem 0.4rem',
                                            borderRadius: '0.25rem',
                                            cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#dee2e6'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#e9ecef'}
                                        title="Click to use"
                                    >
                                        admin123
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem',
                                        padding: '0.25rem 0'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: '#6c757d',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        User Email:
                                    </span>
                                    <span
                                        onClick={() => fillCredentials('user@gmail.com', 'user123')}
                                        style={{
                                            color: '#495057',
                                            fontSize: '0.85rem',
                                            fontFamily: 'monospace',
                                            backgroundColor: '#e9ecef',
                                            padding: '0.2rem 0.4rem',
                                            borderRadius: '0.25rem',
                                            cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#dee2e6'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#e9ecef'}
                                        title="Click to use"
                                    >
                                        user@gmail.com
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem',
                                        padding: '0.25rem 0'
                                    }}
                                >
                                    <span
                                        style={{
                                            color: '#6c757d',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}
                                    >
                                        User Password:
                                    </span>
                                    <span
                                        onClick={() => fillCredentials('user@gmail.com', 'user123')}
                                        style={{
                                            color: '#495057',
                                            fontSize: '0.85rem',
                                            fontFamily: 'monospace',
                                            backgroundColor: '#e9ecef',
                                            padding: '0.2rem 0.4rem',
                                            borderRadius: '0.25rem',
                                            cursor: 'pointer'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#dee2e6'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#e9ecef'}
                                        title="Click to use"
                                    >
                                        user123
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;