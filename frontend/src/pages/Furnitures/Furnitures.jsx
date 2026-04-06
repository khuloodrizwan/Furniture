import React, { useState } from 'react'
import './Furnitures.css'
import FurDisplay from '../../components/FurDisplay/FurDisplay'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'

const Furnitures = () => {
  const [category, setCategory] = useState('All')

  return (
    <div className='furnitures-page'>
    
      <div className='furnitures-body'>
        <ExploreMenu category={category} setCategory={setCategory} />
        <FurDisplay category={category} />
      </div>
    </div>
  )
}

export default Furnitures;