import React, { useContext } from 'react'
import './FurDisplay.css'
import FurItem from '../FurItem/FurItem'
import { StoreContext } from '../../Context/StoreContext'

const FurDisplay = ({category}) => {

  const {fur_list} = useContext(StoreContext);

  return (
    <div className='fur-display' id='fur-display'>
      <h2>Top Pick Furnitures for you</h2>
      <div className='fur-display-list'>
        {fur_list.map((item,index)=>{
          if (category==="All" || category===item.category) {
            return <FurItem key={index} id={item._id} name={item.name} description={item.description} price={item.price}  image={item.image}/>
          }
        })}
      </div>
    </div>
  )
}

export default FurDisplay
