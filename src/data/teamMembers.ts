// Datos de los miembros del equipo
export interface TeamMember {
  id: string;
  name: string;
  position: string;
  image: string;
  fallbackImage: string; // Imagen de respaldo desde Pexels
}

export const teamMembers: TeamMember[] = [
  {
    id: 'alondra-montero',
    name: 'Alondra Monserrat Montero Rubio',
    position: 'CEO',
    image: '/team/alondra-montero.jpg',
    fallbackImage: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
  },
  {
    id: 'elsa-vazquez',
    name: 'Elsa Vanelly Vazquez Parra',
    position: 'CEO',
    image: '/team/elsa-vazquez.jpg',
    fallbackImage: 'https://images.pexels.com/photos/3184318/pexels-photo-3184318.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
  },
  {
    id: 'nancy-gonzalez',
    name: 'Nancy Evelyn González Zertuche',
    position: 'CEO',
    image: '/team/nancy-gonzalez.jpg',
    fallbackImage: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
  },
  {
    id: 'alejandra-garza',
    name: 'Alejandra Garza Elizondo',
    position: 'CEO',
    image: '/team/alejandra-garza.jpg',
    fallbackImage: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
  },
  {
    id: 'andrea-rivera',
    name: 'Andrea Lizzet Rivera Pérez',
    position: 'CEO',
    image: '/team/andrea-rivera.jpg',
    fallbackImage: 'https://images.pexels.com/photos/3184427/pexels-photo-3184427.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
  },
  {
    id: 'bruno-valdez',
    name: 'Bruno Valdez Jimenez',
    position: 'CEO',
    image: '/team/bruno-valdez.jpg',
    fallbackImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
  },
  {
    id: 'yaely-deluna',
    name: 'Yaely Alejandra De Luna',
    position: 'CEO',
    image: '/team/yaely-deluna.jpg',
    fallbackImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2'
  }
];