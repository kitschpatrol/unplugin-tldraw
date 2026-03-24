/* eslint-disable import/no-duplicates */
import imageStatic from '../test/assets/test-sketch.tldr'
import imageStaticDark from '../test/assets/test-sketch.tldr?dark=true&tldr'

const imageStaticElement = document.createElement('img')
imageStaticElement.src = imageStatic
document.body.append(imageStaticElement)

const imageStaticDarkElement = document.createElement('img')
imageStaticDarkElement.src = imageStaticDark
document.body.append(imageStaticDarkElement)
