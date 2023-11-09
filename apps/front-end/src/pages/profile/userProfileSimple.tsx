import { useState } from 'react'
import { userProfile } from '../data'
import axios from 'axios'

interface UserProfileType {
  profileImage: string
  name: string
}

function UserProfileSimplified() {
  const token =
    localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken')

  const axiosInstance = axios.create({
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const handleImage = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'

    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        const file = target.files[0] as File
        setFileToBase(file)
      }
    }

    fileInput.click()
  }

  const setFileToBase = (file: File) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = async () => {
      await axios.put('/api/user/b399a42a-411e-4cdb-9e30-3ed5a0e78d53', {
        foto_perfil: reader.result,
      })
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-r from-orange-500 to-white">
      <div className="flex w-full justify-center">
        <img
          src={userProfile.profileImage}
          alt={userProfile.name}
          className="relative h-24 w-24 rounded-full object-cover md:h-72 md:w-72"
        />
      </div>
      <div className="mt-8 flex flex-col items-center">
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <button className="rounded bg-red-800 px-5 py-2 text-white">
            Remover
          </button>
          <button
            className="rounded bg-gray-700 px-7 py-2 text-white"
            onClick={handleImage}
          >
            Alterar
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserProfileSimplified
