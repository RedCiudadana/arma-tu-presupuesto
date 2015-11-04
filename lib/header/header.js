import config from '../config/config'
import View from '../view/view.js'
import template from './template.jade'

export default new View({
  template: template,
  container: '.header-container',
  model: { title: config.organizationName }
})
