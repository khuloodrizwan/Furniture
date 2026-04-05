import React from 'react'
import Header from '../../components/Header/Header'
import CategoryGrid from '../../components/CategoryGrid/CategoryGrid'
import HowItWorks from '../../components/HowItWorks/HowItWorks'
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs'

const Home = ({ url }) => {
  return (
    <div>
      <Header />
      <CategoryGrid />
      <HowItWorks />
      <WhyChooseUs />
    </div>
  )
}

export default Home