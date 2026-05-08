import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component to capture referral codes from URL parameters
 * and store them in sessionStorage for later use during conversion.
 */
export default function ReferralTracker() {
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const refCode = searchParams.get('ref');

    if (refCode) {
      console.log('Capturing referral code:', refCode);
      sessionStorage.setItem('referral_code', refCode);
    }
  }, [location.search]);

  return null;
}
