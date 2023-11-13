import axios from 'axios'
import React, { useEffect, useState } from 'react'

interface likeProps {
  id_receita: string,
  id_usuario: string,
}

const Like: React.FC<likeProps> = ({id_receita, id_usuario}) => {
  const [stateFav, setStateFav] = useState<boolean>()


  useEffect(() => {
    const fetchFav = async () => {
      const fav = await axios.get('/api/user/'+ id_usuario +'/favorite/'+ id_receita)
      if(fav){
        setStateFav(true)
      } else{
        setStateFav(false)
      }
    }
    fetchFav()
    console.log("sem dep")
  }, [])

  useEffect(() => {
    const fetchFav = async () => {
      const fav = await axios.get('/api/user/'+ id_usuario +'/favorite/'+ id_receita)
      if(fav){
        setStateFav(true)
      } else{
        setStateFav(false)
      }
    }
    fetchFav()
    console.log("com dep de stateFav")
  }, [stateFav])
  
  const token =
  localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken')

  const axiosInstace = axios.create({
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const handleFavorite = async (id_receita: string, id_usuario: string) => {
    try {
      if(stateFav) {
        await axiosInstace.post('/api/recipe/' + id_receita + '/rating',{
          id_usuario,
          id_receita,
          favorito: stateFav,
        });
        setStateFav(false)
      } else {
        await axiosInstace.post('/api/recipe/' + id_receita + '/rating',{
          id_usuario,
          id_receita,
          favorito: stateFav,
        });
        setStateFav(true)
      }
    } catch (error) {
      window.alert('Não foi possivel concluir a ação')
    }
  }

  const favorite = stateFav ? (
    <i className="fa-solid fa-heart fa-xl" style={{ color: '#ff8c00' }}></i>
  ) : (
    <i className="fa-regular fa-heart fa-xl" style={{ color: '#ff8c00' }}></i>
  )

  return (
    <div onClick={() => handleFavorite(id_receita,id_usuario)} className="hidden md:block">
      {favorite}
    </div>
  )
}

export default Like
