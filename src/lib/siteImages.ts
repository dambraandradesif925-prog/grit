import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const fallbackLogo = "https://www.image2url.com/r2/default/images/1782552560598-be980894-9587-4282-a090-92a9620d2aec.png";
export const fallbackHero = "https://www.image2url.com/r2/default/images/1776426806509-5b7fb5f2-959c-4fdf-97c7-c7ba8d67a14e.jpg";

export function getCachedLogo(): string {
  return localStorage.getItem('site_logo_url') || fallbackLogo;
}

export function getCachedHero(): string {
  return localStorage.getItem('site_hero_url') || fallbackHero;
}

export async function fetchUpdatedImages(
  onLogoUpdate?: (url: string) => void,
  onHeroUpdate?: (url: string) => void
) {
  try {
    const settingsSnap = await getDocs(collection(db, 'site_settings'));
    if (!settingsSnap.empty) {
      const data = settingsSnap.docs.map(doc => doc.data());
      const logo = data.find(s => s.key === 'logo_url')?.value;
      const hero = data.find(s => s.key === 'hero_background_url')?.value;
      
      if (logo) {
        localStorage.setItem('site_logo_url', logo);
        if (onLogoUpdate) onLogoUpdate(logo);
      }
      if (hero) {
        localStorage.setItem('site_hero_url', hero);
        if (onHeroUpdate) onHeroUpdate(hero);
      }
    }
  } catch (err) {
    console.error("Error fetching site images", err);
  }
}
