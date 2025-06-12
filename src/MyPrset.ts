import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const MyPreset = definePreset(Aura, {
  // Votre personnalisation
  semantic: {
    primary: {
      500: '#FBFBFB', // light
    },
  },
  components: {
    button: {
      root: {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: '#000', // couleur du texte des boutons
        backgroundColor: '#FBFBFB', // couleur de fond des boutons
        borderColor: '#CCC', // couleur de bordure des boutons
        '&:hover': {
          backgroundColor: '#F0F0F0', // couleur de fond au survol
        },
        '&:active': {
          backgroundColor: '#E0E0E0', // couleur de fond lorsqu'il est actif
        },
      },
      variants: {
        light: {
          color: '#333', // couleur du texte pour la variante light
          backgroundColor: '#FFF', // couleur de fond pour la variante light
          borderColor: '#DDD', // couleur de bordure pour la variante light
        },
      },
    },
  },
});

export { MyPreset };
