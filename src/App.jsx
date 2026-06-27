import { useEffect, useRef, useState } from 'react'
import './App.css'
import ranger1  from "./assets/army-ranger-ally.png"
import ranger2  from "./assets/ranger2.png"
import barrier from "./assets/barrier.png"
import blood from "./assets/blood.png"
import logo from "./assets/logo.png"
import { useNavigate } from 'react-router-dom';
function App() {

  const topLeft = useRef(null); //ranger 1
  const bottomRight = useRef(null); //ranger 2
  const [isShown, setIsShown] = useState(false);
  const navigate = useNavigate();

  setTimeout(()=>{
    setIsShown(true)
  }, 1500)
  setTimeout(()=>
  {
    setIsShown(false)
  }, 2000)

   function begin()
  {
    navigate("/game") 
    //start a room using sockets   
  }

  let img = 
  <div id = "img-bottom-right" >
    <img ref = {bottomRight} id = "ranger" src = {ranger1}></img>
  </div>;  

  let img2 = 
  <div id = "img-top-right" >
    <img ref = {topLeft} id = "img-top-right" src = {ranger2}></img>
  </div>;

  let img3 =
  <div> 
    <img id = "barrier" src = {barrier}></img>
  </div>;

  let img4 = 
  <div id = "img-bottom-right" >
    <img id = "blood" src = {blood}></img>
  </div>
  return (
    <>
      <div id = "container">
  
        <div id = "top">
            <img src={logo}>
            </img>
        </div>
        {img2}
        {img3}
        <div id = "button-layout">
          <button id= "game-button" onClick={() => {begin()}} >
              Play
          </button>
        </div>
        {img}
        {isShown ? img4 : null}
      </div>
    </>
  )
}

export default App
