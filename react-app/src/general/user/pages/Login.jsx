import React from 'react';
import LoginForm from '../components/Login/LoginForm.jsx';

const Login = () => {

    
    return (
        <>
        <div className='container'
         style={{
            width: '100%',       
            height: '100vh',      
            overflow: 'auto',
            backgroundColor: 'white'
          }}
        >
            <LoginForm/>
        </div>
    </>
    );
};

export default Login;