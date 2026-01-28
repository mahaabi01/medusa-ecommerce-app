import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"
import HeroSlider from "../hero-slider"
import AdSlider from "../ad-slider"
import ImageGallery from "@modules/products/components/image-gallery"


const Hero = () => {
  return (
   <div>
    <HeroSlider/>

    <AdSlider />
    <ImageGallery images={images} />
   </div>
  )
}

export default Hero
