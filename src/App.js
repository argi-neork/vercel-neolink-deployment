import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './CommonStyles/style.css'
import './CommonStyles/report.css'
import LoginPage from './CommonPages/LoginPage'
import HomePage from './CommonPages/HomePAge';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;