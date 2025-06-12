describe('Tests de mot de passe oublié', () => {
    beforeEach(() => {
      cy.visit('/forgot-password'); // Remplacez par la route correcte
    });
  
    it("Devrait afficher des erreurs de validation pour un email invalide", () => {
      cy.get('input#email').type('email-invalide'); // Saisissez un email invalide
      cy.contains('Format email invalide *').should('be.visible'); // Vérifiez le message de validation
  
      cy.get('input#email').clear(); // Effacez le champ
      cy.contains("L'email est requis *").should('be.visible'); // Vérifiez le message "requis"
    });
  
    it("Devrait permettre la demande de réinitialisation de mot de passe avec un email valide", () => {
        // Ensure the correct URL is intercepted
        cy.intercept('POST', '/password-reset/request', { statusCode: 200 }).as('demandeReinitialisation');
      
        // Type the email and submit the form
        cy.get('input#email').type('jlassiimariem52@gmail.com');
        cy.get('button[type="submit"]').click();
      
        // Wait for the request and assert the response
        cy.wait('@demandeReinitialisation').its('response.statusCode').should('eq', 200);
      
        // Ensure the success message is visible
        cy.contains('Un email a été envoyé pour réinitialiser votre mot de passe.').should('be.visible');
      });
      
  
    it("Devrait afficher une erreur pour un email non reconnu", () => {
      cy.intercept('POST', '/password-reset/request', { statusCode: 404 }).as('demandeReinitialisation');
  
      cy.get('input#email').type('inconnu@example.com');
      cy.get('button[type="submit"]').click();
  
      cy.wait('@demandeReinitialisation');
      cy.contains('Email non reconnu.').should('be.visible');
    });
  });
  