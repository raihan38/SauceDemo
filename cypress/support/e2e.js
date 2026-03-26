import './commands';

Cypress.on('uncaught:exception', (err) => {
  
  return false;
});