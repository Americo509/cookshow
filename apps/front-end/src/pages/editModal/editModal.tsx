import { useState, ChangeEvent, useEffect, FormEvent } from 'react'
import { Modal } from 'flowbite-react'
import TextareaAutosize from 'react-textarea-autosize'
import axios, { AxiosError } from 'axios'
import { typeIngredient } from '../../types/typeIngredient'

const token =
  localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken')

const axiosInstance = axios.create({
  timeout: 5000,
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})

interface propsModal {
  show: boolean | undefined
  setOpenModalEdit: (value: boolean | undefined) => void
  id: string
  edited: (value: boolean) => void
}

const EditModal: React.FC<propsModal> = ({
  show,
  setOpenModalEdit,
  id,
  edited,
}) => {
  interface inputIngrediente {
    id: number
    ingredient: string
    quantity: number
  }

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [inputList, setInputList] = useState<inputIngrediente[]>([])
  const [recipeName, setRecipeName] = useState('')
  const [recipeTime, setRecipeTime] = useState('')
  const [recipeMode, setRecipeMode] = useState('')
  const [isFocused, setIsFocused] = useState<boolean[]>([])
  const [selectedFile, setSelectedFile] = useState<File>()
  const [recipeDifficulty, setRecipeDifficulty] = useState('')
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({
    recipeName: '',
    recipeTime: '',
    recipeMode: '',
    recipePhoto: '',
  })
  const [ingredient, setIngredients] = useState<typeIngredient[]>([
    { nome: '', id: 0 },
  ])
  const [showModal, setShowModal] = useState(show)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadIngredients()
        const recipe = await axios.get('/api/recipe/' + id)
        const recipeData = { ...recipe.data }

        const ingredientsPromises = recipeData.ingredients.map(
          async (el: { ingredient: string }) => {
            const response = await axios.get(
              '/api/ingredient/' + el.ingredient + '/getById',
            )
            return response.data
          },
        )

        Promise.all(ingredientsPromises).then((ingredientsData) => {
          setInputList(
            ingredientsData.map((el) => ({
              id: el.id,
              ingredient: el.nome,
              quantity: 0,
            })),
          )
        })

        deleteAllIngrediente()
        setSelectedFile(recipeData.imagem)
        setPreview(recipeData.imagem)
        setRecipeName(recipeData.titulo)
        setRecipeTime(recipeData.tempo_preparo)
        setRecipeMode(recipeData.descricao)
        setRecipeDifficulty(recipeData.dificuldade)

        console.log('Dados carregados')
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }

    fetchData()
  }, [])

  const deleteAllIngrediente = async () => {
    const recipe = await axios.get('/api/recipe/' + id)
    const recipeData = { ...recipe.data }

    const ingredientsPromises = recipeData.ingredients.map(
      async (el: { ingredient: string }) => {
        const response = await axios.get(
          '/api/ingredient/' + el.ingredient + '/getById',
        )
        return response.data
      },
    )

    Promise.all(ingredientsPromises).then((ingredientsData) => {
      ingredientsData.map((el) => {
        axiosInstance.post('/api/recipe/ingredientRecipe', {
          id_ingrediente: el.id,
          id_receita: id,
        })
      })
    })
  }

  const LoadSuggestions = (item: inputIngrediente, inputIndex: number) => {
    if (isFocused[inputIndex] !== true) return
    return (
      <div className="absolute top-0 w-full rounded-md bg-gray-100 shadow">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="cursor-pointer border-t border-gray-300 p-1.5 text-orange-500 hover:bg-gray-200"
            onClick={() => {
              const list: Array<inputIngrediente> = [...inputList]

              const foundItem = list.find((it) => it === item)

              if (foundItem) {
                foundItem.ingredient = suggestion
                const matchingIngredient = ingredient.find(
                  (i) => i.nome === foundItem.ingredient,
                )

                if (matchingIngredient) {
                  foundItem.id = matchingIngredient.id
                }
              }

              setInputList(list)
              suggestions.length = 0
              const focused: Array<boolean> = [...isFocused]
              focused[inputIndex] = false
              setIsFocused(focused)
            }}
          >
            {suggestion}
          </div>
        ))}
      </div>
    )
  }

  const handleInputIngredientChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const { name, value } = e.target
    const list: Array<inputIngrediente> = [...inputList]

    list[index] = {
      ...list[index],
      [name]: value,
    }

    const ingredientName = ingredient.map((el) => {
      return el.nome
    })
    const selectedIngredients = inputList.map((item) => item.ingredient)

    const filtered = ingredientName?.filter((item) => {
      if (item)
        return (
          item.toLowerCase().startsWith(value.toLowerCase()) &&
          !selectedIngredients.includes(item) // Exclua os ingredientes selecionados
        )
    })
    setSuggestions(value ? filtered.slice(0, 5) : [])
    const focused: Array<boolean> = [...isFocused]
    focused[index] = true
    setIsFocused(focused)
  }

  const handleRemoveClick = async (index: number) => {
    const list: Array<inputIngrediente> = [...inputList]
    list.splice(index, 1)
    setInputList(list)
  }

  const handleAddClick = () => {
    const lastIndex = inputList[inputList.length - 1]
    if (lastIndex.ingredient !== '') {
      setInputList([...inputList, { id: 0, ingredient: '', quantity: 0 }])
    }
  }

  const handleFieldChange = (fieldName: string, msg: string) => {
    if (msg) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: msg,
      }))
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [fieldName]: '',
      }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const hasErrors = Object.values(errors).some((error) => !!error)
    if (!hasErrors) {
      try {
        const recipe = await axios.get('/api/recipe/' + id)
        const Response = await axiosInstance.put('/api/recipe/' + id, {
          titulo: recipeName,
          descricao: recipeMode,
          tempo_preparo: recipeTime,
          dificuldade: recipeDifficulty,
          calorias: 0, //remover
          imagem: recipe.data.imagem,
        })

        if (Response) handleCloseModal()
        window.alert('Receita enviada aguarde a análise.')
      } catch (err) {
        window.alert(err)
      }
    }
  }

  const loadIngredients = async () => {
    console.log('chamando load ingrediente')
    try {
      await axios.get('/api/ingredient').then((Response) => {
        setIngredients(Response.data)
      })
    } catch (error) {
      alert(error)
    }
  }

  const handleCloseModal = () => {
    inputList.map(async (el) => {
      const urlIngredient = '/api/recipe/' + id + '/ingredient/' + el.id

      await axiosInstance.post(urlIngredient, {
        portion: el.quantity,
      })
    })
    edited(true)
    setShowModal(undefined)
    setOpenModalEdit(undefined) // Define o valor como undefined no pai
  }

  return (
    <Modal show={showModal} onClose={() => handleCloseModal()} size="5xl">
      <form onSubmit={handleSubmit}>
        <Modal.Body className="flex flex-col justify-between bg-white p-0 md:flex-row">
          <div className="flex flex-col items-center justify-center rounded-tl-lg p-5">
            <button
              className="self-start text-xl text-black"
              onClick={() => handleCloseModal()}
            >
              X
            </button>
            <div className="align-center flex h-72 w-72 justify-center overflow-hidden rounded-full border border-solid border-[#FF7A00] bg-white">
              {selectedFile && (
                <img
                  src={preview}
                  alt="imagem escolhida"
                  className="h-full w-full"
                />
              )}
              {errors.recipePhoto && (
                <p className="self-center text-center text-red-500">
                  {errors.recipePhoto}
                </p>
              )}
            </div>
          </div>
          <div className="flex max-h-[70vh] w-full flex-col space-y-6 overflow-y-auto p-5">
            <div className="h-full">
              <input
                type="text"
                name="recipeName"
                id="recipeName"
                placeholder="Título da receita"
                className="block w-full rounded-lg border-none bg-gray-100 p-3 outline-none focus:outline-orange-400 focus:ring-0"
                value={recipeName}
                onChange={(e) => {
                  setRecipeName(e.target.value)
                  handleFieldChange('recipeName', '')
                }}
                onBlur={(e) => {
                  const inputValue = e.target.value
                  if (!inputValue.trim()) {
                    setRecipeName('')
                    handleFieldChange(
                      'recipeName',
                      'O campo deve conter letras',
                    )
                  }
                  if (!inputValue.match(/^[^\d]+$/)) {
                    setRecipeName('')
                    handleFieldChange(
                      'recipeName',
                      'O campo deve apenas letras e espaços',
                    )
                  }
                }}
                required
              />
              {errors.recipeName && (
                <p className="text-red-500">{errors.recipeName}</p>
              )}
            </div>
            {inputList.map((item, i) => {
              return (
                <div className="box">
                  <div className="flex">
                    <div className="flex w-full flex-col items-center justify-center">
                      <div className="flex w-full flex-col">
                        <input
                          type="text"
                          name="ingredient"
                          value={item.ingredient}
                          onChange={(e) => handleInputIngredientChange(e, i)}
                          placeholder="Ingrediente"
                          className="block h-full w-full rounded-lg border-none bg-gray-100 p-3 outline-none focus:outline-orange-400 focus:ring-0"
                          autoComplete="off"
                          required
                        />
                      </div>
                      <div className="relative w-full">
                        {isFocused[i] && LoadSuggestions(item, i)}
                      </div>
                    </div>
                  </div>
                  <div className="btn-box flex flex-col items-start">
                    {inputList.length !== 1 && (
                      <button
                        className="text-red-500"
                        type="button"
                        onClick={() => handleRemoveClick(i)}
                      >
                        Remover
                      </button>
                    )}
                    {inputList.length - 1 === i && (
                      <button className="mt-4" onClick={handleAddClick}>
                        + ingrediente
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            <div className="h-full">
              <input
                type="time"
                name="recipeTime"
                id="recipeTime"
                className="before-content [&:not(:valid)] block w-2/4 min-w-max rounded-lg border-none bg-gray-100 p-3 outline-none focus:outline-orange-400 focus:ring-0"
                value={recipeTime}
                onChange={(e) => {
                  setRecipeTime(e.target.value)
                  handleFieldChange('recipeTime', '')
                }}
                onBlur={(e) => {
                  const inputValue = e.target.value
                  if (!inputValue.trim()) {
                    setRecipeTime('')
                    handleFieldChange('recipeTime', 'Informe um tempo')
                  }
                }}
                required
              />
              {errors.recipeTime && (
                <p className="text-red-500">{errors.recipeTime}</p>
              )}
            </div>
            <div className="h-full w-full">
              <label htmlFor="recipeDifficulty">Dificuldade da receita: </label>
              <select
                name="recipeDifficulty"
                id="recipeDifficulty"
                className="rounded-lg border border-transparent bg-gray-100 outline-none focus:border focus:border-orange-400 focus:outline-none focus:ring-0"
                value={recipeDifficulty}
                onChange={(e) => {
                  setRecipeDifficulty(e.target.value)
                }}
              >
                <option value="Facil">Facil</option>
                <option value="Medio">Medio</option>
                <option value="Dificil">Dificil</option>
              </select>
            </div>
            <div className="h-full">
              <TextareaAutosize
                minRows={1}
                maxRows={5}
                name="recipeMode"
                id="recipeMode"
                placeholder="Modo de preparo da receita"
                className="block w-full rounded-lg border-none bg-gray-100 p-3 outline-none focus:outline-orange-400 focus:ring-0"
                value={recipeMode}
                onChange={(e) => {
                  setRecipeMode(e.target.value)
                  handleFieldChange('recipeMode', '')
                }}
                onBlur={(e) => {
                  const inputValue = e.target.value
                  if (!inputValue.trim()) {
                    setRecipeMode('')
                    handleFieldChange(
                      'recipeMode',
                      'O modo de preparo deve ser informado',
                    )
                  }
                }}
                required
              />
              {errors.recipeMode && (
                <p className="text-red-500">{errors.recipeMode}</p>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex items-center justify-center bg-white">
          <button
            className="h-12 w-72 bg-[#9C4B00] text-white duration-300 hover:bg-[#6d3500]"
            type="submit"
          >
            Compartilhar
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default EditModal
