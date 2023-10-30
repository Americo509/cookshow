import React, { useState, ChangeEvent, useEffect, FormEvent } from 'react'
import { Button, Modal } from 'flowbite-react'
import { alimentos } from './mockAlimentos'
import TextareaAutosize from 'react-textarea-autosize'
//import axios from 'axios';

const ModalDefault = () => {
  const [openModal, setOpenModal] = useState<string | undefined>()
  const props = { openModal, setOpenModal }
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [inputList, setInputList] = useState([{ ingredient: '', quantity: '' }])
  const [recipeName, setRecipeName] = useState('')
  const [recipeTime, setRecipeTime] = useState('')
  const [recipeCategory, setRecipeCategory] = useState('')
  const [recipeMode, setRecipeMode] = useState('')
  const [isFocused, setIsFocused] = useState<boolean[]>([])
  const [selectedFile, setSelectedFile] = useState<File>()
  const [preview, setPreview] = useState('')
  const [errors, setErrors] = useState({
    recipeName: '',
    recipeTime: '',
    recipeCategory: '',
    recipeMode: '',
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  interface inputIngrediente {
    ingredient: string
    quantity: string
  }

  useEffect(() => {
    if (!selectedFile) {
      setPreview('')
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined)
      return
    }

    setSelectedFile(e.target.files[0])
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
              // eslint-disable-next-line array-callback-return
              list.find((it, ind) => {
                if (it === item) {
                  list[ind].ingredient = suggestion
                }
              })
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
    list[index][name] = value
    setInputList(list)
    const filtered = alimentos.filter((item) =>
      item.toLowerCase().startsWith(value.toLowerCase()),
    )
    setSuggestions(value ? filtered.slice(0, 5) : [])
    const focused: Array<boolean> = [...isFocused]
    focused[index] = true
    setIsFocused(focused)
  }

  const handleRemoveClick = (index: number) => {
    const list: Array<inputIngrediente> = [...inputList]
    list.splice(index, 1)
    setInputList(list)
  }

  const handleAddClick = () => {
    const lastIndex = inputList[inputList.length - 1]
    if (lastIndex.ingredient !== '' && lastIndex.quantity !== '') {
      setInputList([...inputList, { ingredient: '', quantity: '' }])
    }
  }

  const handleQuantityChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = event.target.value
    if (!isNaN(+value)) {
      const list = [...inputList]
      list[index].quantity = value
      setInputList(list)
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const hasErrors = Object.values(errors).some((error) => !!error)
    if (!hasErrors) {
      setOpenModal('')
      setShowSuccessMessage(true) // Mostrar a mensagem de sucesso
      setTimeout(() => {
        setShowSuccessMessage(false) // Ocultar a mensagem de sucesso após alguns segundos
      }, 3000)
    }
    /*const url = "/api/recipe"

      axios.post(url, {
        recipePhoto: preview,
        recipeName: recipeName,
        ingredients: inputList,
        recipeTime: recipeTime,
        recipeCategory: recipeCategory,
        recipeMode: recipeMode
      },{
        headers: {
          'Content-Type': 'application/json',
          'Accept' : 'application/json',
        }
      })
      .then(Response => {
        const data = Response.data
        console.log(Response);
      }).catch(err => console.log(err.response));
      }
    */
  }

  return (
    <>
      <Button onClick={() => props.setOpenModal('default')}>
        Toggle modal
      </Button>
      {showSuccessMessage && (
        <div
          className="fixed top-0 right-0 mb-4 flex items-center rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-gray-800 dark:text-green-400"
          role="alert"
        >
          <svg
            className="mr-3 inline h-4 w-4 flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div>
            <span className="font-medium">Receita enviada</span> aguarde a
            análise.
          </div>
        </div>
      )}
      <Modal
        show={props.openModal === 'default'}
        onClose={() => props.setOpenModal(undefined)}
        size="5xl"
      >
        <form onSubmit={handleSubmit}>
          <Modal.Body className="flex flex-col justify-between bg-white p-0 md:flex-row">
            <div className="flex flex-col items-center justify-center rounded-tl-lg p-5">
              <button
                className="self-start text-xl text-black"
                onClick={() => props.setOpenModal(undefined)}
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
              </div>
              <div className="flex flex-col items-center justify-center p-2">
                <p className="">Selecione uma foto do seu dispositivo</p>
                <div className="mt-4 flex h-10 w-36 items-center justify-center rounded-md bg-[#2D3748] duration-300 hover:bg-[#1f2732]">
                  <label
                    htmlFor="photoRecipe"
                    className="custom-file-upload h-full w-full cursor-pointer text-center text-sm text-white"
                  >
                    <p className="flex h-full w-full items-center justify-center">
                      Selecionar
                    </p>
                  </label>
                </div>
                <input
                  id="photoRecipe"
                  name="photoRecipe"
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="hidden"
                />
              </div>
            </div>
            <div className="flex max-h-[70vh] w-full flex-col space-y-6 overflow-y-scroll p-5">
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
                    if (!inputValue.match(/^[A-Za-z\s]+$/)) {
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
                      <div className="flex w-4/5 flex-col items-center justify-center">
                        <div className="flex w-full flex-col">
                          <input
                            type="text"
                            name="ingredient"
                            value={item.ingredient}
                            onChange={(e) => handleInputIngredientChange(e, i)}
                            placeholder="Ingrediente"
                            className="block h-full w-full rounded-lg border-none bg-gray-100 p-3 outline-none focus:outline-orange-400 focus:ring-0"
                            required
                          />
                        </div>
                        <div className="relative w-full">
                          {isFocused[i] && LoadSuggestions(item, i)}
                        </div>
                      </div>
                      <div className="ml-14 h-full w-1/5">
                        <input
                          className="block h-full w-full rounded-lg border-none bg-gray-100 p-3 text-center outline-none focus:outline-orange-400 focus:ring-0"
                          type="text"
                          required
                          name="quantity"
                          placeholder="Qnt"
                          value={item.quantity}
                          onChange={(e) => {
                            handleQuantityChange(e, i)
                          }}
                        />
                      </div>
                    </div>
                    <div className="btn-box flex flex-col items-start">
                      {inputList.length !== 1 && (
                        <button
                          className="text-red-500"
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
              <div className="h-full">
                <TextareaAutosize
                  minRows={1}
                  maxRows={5}
                  name="recipeCategory"
                  id="recipeCategory"
                  placeholder="Origem da receita"
                  className="block w-full break-words rounded-lg border-none bg-gray-100 p-3 outline-none focus:outline-orange-400 focus:ring-0"
                  value={recipeCategory}
                  onChange={(e) => {
                    setRecipeCategory(e.target.value)
                    handleFieldChange('recipeCategory', '')
                  }}
                  onBlur={(e) => {
                    const inputValue = e.target.value
                    if (!inputValue.trim()) {
                      setRecipeCategory('')
                      handleFieldChange(
                        'recipeCategory',
                        'O campo deve conter letras',
                      )
                    }
                    if (!inputValue.match(/^[A-Za-z\s]+$/)) {
                      setRecipeCategory('')
                      handleFieldChange(
                        'recipeCategory',
                        'O campo deve apenas letras e espaços',
                      )
                    }
                  }}
                  required
                />
                {errors.recipeCategory && (
                  <p className="text-red-500">{errors.recipeCategory}</p>
                )}
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
                        'O campo deve conter letras',
                      )
                    }
                    if (!inputValue.match(/^[A-Za-z\s]+$/)) {
                      setRecipeMode('')
                      handleFieldChange(
                        'recipeMode',
                        'O campo deve apenas letras e espaços',
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
    </>
  )
}

export default ModalDefault