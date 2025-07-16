import React, { useState } from 'react';
import { TeamMember } from '../../data/teamMembers';

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-square overflow-hidden relative">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Cargando...</div>
          </div>
        )}
        <img
          src={imageError ? member.fallbackImage : member.image}
          alt={member.name}
          className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      </div>
      <div className="p-6 text-center">
        <h4 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h4>
        <p className="text-orange-600 font-medium">{member.position}</p>
      </div>
    </div>
  );
};

export default TeamMemberCard;