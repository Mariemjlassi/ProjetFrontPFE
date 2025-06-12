import { Injectable } from '@angular/core';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

@Injectable({
  providedIn: 'root'
})
export class AiDashboardService {
  private model: tf.Sequential | null = null;
  
  constructor() { }

  // Initialisation simplifiée du modèle
  async initModel() {
    this.model = tf.sequential();
    
    // Architecture simplifiée
    this.model.add(tf.layers.dense({
      units: 12, // Réduit le nombre de neurones
      activation: 'relu',
      inputShape: [4] // 4 indicateurs comme avant
    }));
    
    this.model.add(tf.layers.dense({
      units: 3, // 3 sorties: normal, warning, danger
      activation: 'softmax'
    }));

    // Configuration de l'entraînement
    this.model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  // Données d'entraînement plus réalistes
  async prepareTrainingData(stats: any) {
    // Génération de données d'entraînement simulées mais plus variées
    const trainingData = [];
    
    // Génère 50 exemples aléatoires
    for (let i = 0; i < 50; i++) {
      const totalUsers = Math.floor(Math.random() * 50) + 1;
      const lockedAccounts = Math.floor(Math.random() * totalUsers);
      const totalActions = Math.floor(Math.random() * 500);
      const lastWeekActions = Math.floor(Math.random() * 100);
      
      // Détermine la catégorie basée sur des règles simples
      let category;
      if (lockedAccounts > totalUsers * 0.2 || lastWeekActions > 80) {
        category = [0, 0, 1]; // Danger
      } else if (lockedAccounts > totalUsers * 0.1 || lastWeekActions > 50) {
        category = [0, 1, 0]; // Warning
      } else {
        category = [1, 0, 0]; // Normal
      }
      
      trainingData.push({
        inputs: [totalUsers, lockedAccounts, totalActions, lastWeekActions],
        outputs: category
      });
    }
    
    // Ajoute les vraies données actuelles
    trainingData.push({
      inputs: [
        stats.totalUsers,
        stats.lockedAccounts, 
        stats.totalActions,
        stats.lastWeekActions
      ],
      outputs: [1, 0, 0] // Considéré comme normal par défaut
    });

    return trainingData;
  }

  // Entraînement réel
  async trainModel(stats: any) {
    if (!this.model) {
      await this.initModel();
    }
    
    const trainingData = await this.prepareTrainingData(stats);
    
    // Convertir en tenseurs TensorFlow
    const inputs = trainingData.map(d => d.inputs);
    const outputs = trainingData.map(d => d.outputs);
    
    const inputTensor = tf.tensor2d(inputs);
    const outputTensor = tf.tensor2d(outputs);
    
    // Entraînement avec une seule epoch pour aller vite (dans un cas réel, mettre plus)
    await this.model!.fit(inputTensor, outputTensor, {
      epochs: 1,
      batchSize: 8,
      validationSplit: 0.2
    });
    
    // Nettoyage mémoire
    tf.dispose([inputTensor, outputTensor]);
  }

  // Prédiction simplifiée
  async predictSystemStatus(stats: any): Promise<string> {
    if (!this.model) {
      await this.trainModel(stats);
    }
    
    const input = tf.tensor2d([[
      stats.totalUsers,
      stats.lockedAccounts,
      stats.totalActions,
      stats.lastWeekActions
    ]]);
    
    const prediction = this.model!.predict(input) as tf.Tensor;
    const [normalProb, warningProb, dangerProb] = Array.from(await prediction.data());
    
    tf.dispose(input); // Nettoyage
    
    // Règles de décision simplifiées
    if (dangerProb > 0.7) {
      return `DANGER (${Math.round(dangerProb * 100)}%) - Activité anormale détectée`;
    } else if (warningProb > 0.5) {
      return `WARNING (${Math.round(warningProb * 100)}%) - Surveillance recommandée`;
    } else {
      return `NORMAL (${Math.round(normalProb * 100)}%) - Tout va bien`;
    }
  }
  // Analyse les tendances des activités
  analyzeActivityTrends(activities: any[]): string {
    // Simple analyse des tendances (pourrait être améliorée)
    const lastWeekCount = activities.filter(a => {
      const date = new Date(a.timestamp);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return date > oneWeekAgo;
    }).length;

    const totalCount = activities.length;
    const ratio = lastWeekCount / (totalCount || 1);

    if (ratio > 0.5) {
      return `Activité élevée: ${lastWeekCount} actions cette semaine (${(ratio * 100).toFixed(0)}% du total)`;
    } else if (ratio > 0.3) {
      return `Activité normale: ${lastWeekCount} actions cette semaine`;
    } else {
      return `Activité faible: ${lastWeekCount} actions cette semaine`;
    }
  }

// Détecte les anomalies de sécurité
detectSecurityAnomalies(failedAttempts: any[]): string {
  if (failedAttempts.length === 0) {
    return "Aucune anomalie de sécurité détectée";
  }

  // 1. Filtrer les tentatives récentes (7 derniers jours)
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 7);
  
  const recentAttempts = failedAttempts.filter(a => 
    new Date(a.timestamp) >= recentCutoff
  );

  // 2. Compter les tentatives par utilisateur
  const userAttempts = new Map<string, number>();
  
  recentAttempts.forEach(a => {
    const username = a.utilisateur?.username || 'inconnu';
    userAttempts.set(username, (userAttempts.get(username) || 0) + 1);
  });

  // 3. Trouver les comptes verrouillés
  const lockedAccounts = recentAttempts
    .filter(a => a.description.toLowerCase().includes('verrouillé'))
    .map(a => a.utilisateur?.username || 'inconnu');

  // 4. Trouver les comptes avec 3+ tentatives
  const highRiskUsers = Array.from(userAttempts.entries())
    .filter(([_, count]) => count >= 3)
    .map(([username, _]) => username);

  // 5. Générer le message d'alerte
  if (lockedAccounts.length > 0) {
    return `COMPTE(S) VERROUILLÉ(S): ${lockedAccounts.join(', ')}`;
  }
  
  if (highRiskUsers.length > 0) {
    const usersWithAttempts = highRiskUsers.map(username => {
      const count = userAttempts.get(username) || 0;
      return `${username} (${count} tentatives)`;
    });
    
    return `ALERTE: ${usersWithAttempts.join(', ')}`;
  }

  if (recentAttempts.length > 0) {
    return `Activité normale: ${recentAttempts.length} tentative(s) récente(s)`;
  }

  return "Aucune activité suspecte récente";
}
  // Dans AiDashboardService

}