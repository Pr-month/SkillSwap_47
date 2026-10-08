import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../../../app/store/store'
import AuthStepSecondPage from './Step2'
import { uploadFileApi } from '../../../api/uploadApi'

jest.mock('../../../api/uploadApi', () => ({
  uploadFileApi: jest.fn(),
}))

jest.mock('../../../shared/ui/DataInput/DataInput', () => ({
  DataInput: ({
    value,
    onChange,
    label,
  }: {
    value?: string
    onChange?: (value: string) => void
    label?: string
  }) => (
    <label>
      {label}
      <input
        aria-label={label}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  ),
}))

const uploadFileApiMock = uploadFileApi as jest.MockedFunction<typeof uploadFileApi>

const renderStep2 = () => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: {
      skill: {
        allSkills: [],
        allCategories: [{ id: 'cat-1', name: 'Творчество' }],
        allSubcategories: [{ id: 'sub-1', name: 'Музыка', categoryId: 'cat-1' }],
        draftSkill: {},
        profileSkill: null,
        isForSwap: [],
        isLoading: false,
        isLoadingCreateSkill: false,
        isLoadingUpdateSkill: false,
        error: null,
        errorCreateSkill: null,
        errorUpdateSkill: null,
      },
      city: {
        allCity: [{ id: 'city-1', name: 'Москва' }],
        isLoadingCities: false,
        errorCities: null,
      },
    },
  })

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/register/step-2']}>
        <AuthStepSecondPage />
      </MemoryRouter>
    </Provider>,
  )

  return store
}

describe('Step2 avatar upload', () => {
  beforeEach(() => {
    uploadFileApiMock.mockReset()
  })

  it('пишет URL в draft после успешной загрузки', async () => {
    const user = userEvent.setup()
    uploadFileApiMock.mockResolvedValue('/uploads/avatar.png')
    const store = renderStep2()

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    await waitFor(() => {
      expect(uploadFileApiMock).toHaveBeenCalledWith(file)
      expect(store.getState().user.draftUser.avatarUrl).toBe('/uploads/avatar.png')
    })

    expect(screen.getByAltText('Аватар').getAttribute('src')).toBe('/uploads/avatar.png')
  })

  it('блокирует «Продолжить» во время загрузки', async () => {
    const user = userEvent.setup()
    let resolveUpload: (url: string) => void = () => undefined
    uploadFileApiMock.mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveUpload = resolve
        }),
    )
    renderStep2()

    const continueButton = screen.getByRole('button', { name: 'Продолжить' }) as HTMLButtonElement
    expect(continueButton.disabled).toBe(true)

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    await waitFor(() => {
      expect(
        (screen.getByRole('button', { name: 'Загрузка аватара' }) as HTMLButtonElement).disabled,
      ).toBe(true)
      expect(continueButton.disabled).toBe(true)
    })

    resolveUpload('/uploads/avatar.png')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Выбрать аватар' })).toBeTruthy()
    })
  })

  it('показывает ошибку и не сохраняет файл в draft', async () => {
    const user = userEvent.setup()
    uploadFileApiMock.mockRejectedValue(new Error('Допустимы только изображения'))
    const store = renderStep2()

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText('Допустимы только изображения')).toBeTruthy()
      expect(store.getState().user.draftUser.avatarUrl).toBeUndefined()
    })

    expect((screen.getByRole('button', { name: 'Продолжить' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
  })
})
