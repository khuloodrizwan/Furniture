import React, { useContext } from 'react'
import './FurDisplay.css'
import FurItem from '../FurItem/FurItem'
import { StoreContext } from '../../Context/StoreContext'

const FurDisplay = ({category}) => {

  const { fur_list = [] } = useContext(StoreContext);

  return (
    <div className='fur-display' id='fur-display'>
      
      <div className='fur-display-list'>
        {fur_list.map((item,index)=>{
          if (category==="All" || category===item.category) {
            return <FurItem 
              key={index} 
              id={item._id} 
              name={item.name} 
              description={item.description} 
              price={item.price} 
              image={item.image}
              isDealActive={item.isDealActive}
              discountType={item.discountType}
              discountValue={item.discountValue}
            />
          }
        })}
      </div>
    </div>
  )
}

export default FurDisplay