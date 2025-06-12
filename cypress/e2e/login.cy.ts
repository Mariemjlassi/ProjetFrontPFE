describe('Login Test', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4200/login'); // Remplace par le chemin correct si nécessaire
    });
  
    it('Devrait afficher le formulaire de connexion', () => {
      cy.get('input#username').should('be.visible');
      cy.get('input#password').should('be.visible');
      cy.get('re-captcha').should('be.visible');
      cy.get('button[type="submit"]').should('be.disabled'); // Vérifie que le bouton est désactivé au début
    });
  
    it('Devrait se connecter avec succès avec des identifiants valides', () => {
      cy.get('input#username').type('admin123'); // Remplace avec un utilisateur valide
      cy.get('input#password').type('Jlassi914'); // Remplace avec un mot de passe valide
      cy.get('re-captcha').should('be.visible'); // Vérifier si le CAPTCHA est affiché (simuler la résolution)
      cy.get('button[type="submit"]').click({ force: true });
      

  
     
    });
  
    it('Devrait afficher un message d\'erreur pour des identifiants incorrects', () => {
      cy.get('input#username').type('wrongUser');
      cy.get('input#password').type('wrongPassword');
      cy.get('button[type="submit"]').click({ force: true });
        
      
    });
  });
  