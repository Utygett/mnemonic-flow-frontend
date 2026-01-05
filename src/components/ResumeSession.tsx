import React from 'react';
import './ResumeSession.css';

interface ResumeSessionCardProps {
  title: string;
  subtitle: string;
  cardInfo: string;
  onResume: () => void;
  onDiscard: () => void;
}

export function ResumeSessionCard({ 
  title, 
  subtitle, 
  cardInfo, 
  onResume, 
  onDiscard 
}: ResumeSessionCardProps) {
  return (
    <div className="resume-session">
      <div className="resume-session__card">
        <h3 className="resume-session__title">{title}</h3>
        <p className="resume-session__subtitle">{subtitle}</p>
        <p className="resume-session__info">{cardInfo}</p>
        
        <div className="resume-session__buttons">
          <button 
            className="resume-session__button resume-session__button--primary" 
            onClick={onResume}
          >
            Продолжить
          </button>
          <button 
            className="resume-session__button resume-session__button--secondary" 
            onClick={onDiscard}
          >
            Сбросить
          </button>
        </div>
      </div>
    </div>
  );
}
