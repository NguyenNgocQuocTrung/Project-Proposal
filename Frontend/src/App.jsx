import Footer from './components/layout/footer';
import Header from './components/layout/header';
import { Outlet } from "react-router-dom";
function App() {

  return (
    <div>
      <div className='container'>
        <Header />
      </div>
      <div>
        <Outlet />
      </div>
      <div className='container'>
        <Footer />
      </div>
    </div>
  )
}

export default App
