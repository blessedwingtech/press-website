'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

interface ReviewCTAProps {
  className?: string;
}

export default function ReviewCTA({ className }: ReviewCTAProps) {
  const { data: session } = useSession();
  const [returnUrl, setReturnUrl] = useState('');

  useEffect(() => {
    setReturnUrl(window.location.href);
  }, []);

  const baseUrl = process.env.NEXT_PUBLIC_AVIS_HUB_URL || 'https://avis.bittonik.com';
  let href = `${baseUrl}?source=PRESSTONIK`;

  if (session?.user) {
    const params = new URLSearchParams();
    params.append('source', 'PRESSTONIK');
    
    const user = session.user as any;
    if (user.id) params.append('user_id', user.id);
    if (user.name) params.append('full_name', user.name);
    if (user.email) params.append('email', user.email);
    if (user.image) params.append('avatar', user.image);
    
    if (returnUrl) params.append('return_url', returnUrl);
    
    href = `${baseUrl}?${params.toString()}`;
  }

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={className || "text-emerald-400 hover:text-emerald-300 font-extrabold transition-colors"}
    >
      Donner votre avis
    </a>
  );
}
