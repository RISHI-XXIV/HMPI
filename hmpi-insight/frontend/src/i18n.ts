import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Ensuring Safe Groundwater, Protecting Public Health',
      checkWaterSafety: 'Check Water Safety',
      enterPincode: 'Enter PIN Code',
      useGPS: 'Use GPS Location',
      hmpiCalculator: 'HMPI Calculator',
      uploadData: 'Upload Data',
      viewMap: 'View Map',
      dashboard: 'Dashboard',
      alerts: 'Alerts',
      reports: 'Reports',
      safe: 'Safe',
      moderate: 'Moderate',
      high: 'High',
      critical: 'Critical',
      metalConcentrations: 'Metal Concentrations',
      calculate: 'Calculate',
      results: 'Results',
      recommendations: 'Recommendations',
      downloadReport: 'Download Report',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
    }
  },
  hi: {
    translation: {
      welcome: 'सुरक्षित भूजल सुनिश्चित करना, सार्वजनिक स्वास्थ्य की रक्षा करना',
      checkWaterSafety: 'पानी की सुरक्षा जांचें',
      enterPincode: 'पिन कोड दर्ज करें',
      useGPS: 'GPS स्थान का उपयोग करें',
      hmpiCalculator: 'HMPI कैलकुलेटर',
      uploadData: 'डेटा अपलोड करें',
      viewMap: 'नक्शा देखें',
      dashboard: 'डैशबोर्ड',
      alerts: 'चेतावनी',
      reports: 'रिपोर्ट',
      safe: 'सुरक्षित',
      moderate: 'मध्यम',
      high: 'उच्च',
      critical: 'गंभीर',
      metalConcentrations: 'धातु सांद्रता',
      calculate: 'गणना करें',
      results: 'परिणाम',
      recommendations: 'सिफारिशें',
      downloadReport: 'रिपोर्ट डाउनलोड करें',
      login: 'लॉग इन',
      register: 'रजिस्टर',
      logout: 'लॉग आउट',
    }
  },
  ta: {
    translation: {
      welcome: 'பாதுகாப்பான நிலத்தடி நீரை உறுதிசெய்தல், பொது சுகாதாரத்தை பாதுகாத்தல்',
      checkWaterSafety: 'நீர் பாதுகாப்பை சரிபார்க்கவும்',
      // Add more Tamil translations
    }
  },
  te: {
    translation: {
      welcome: 'సురక్షిత భూగర్భ జలాలను నిర్ధారించడం, ప్రజా ఆరోగ్యాన్ని రక్షించడం',
      checkWaterSafety: 'నీటి భద్రతను తనిఖీ చేయండి',
      // Add more Telugu translations
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
