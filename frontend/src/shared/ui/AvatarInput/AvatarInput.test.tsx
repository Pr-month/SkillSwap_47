import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AvatarInput } from './AvatarInput'

describe('AvatarInput', () => {
  it('передаёт выбранный File наружу без base64', async () => {
    const user = userEvent.setup()
    const onFileSelect = jest.fn()

    render(<AvatarInput value={undefined} onFileSelect={onFileSelect} />)

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(onFileSelect).toHaveBeenCalledTimes(1)
    expect(onFileSelect.mock.calls[0][0]).toBeInstanceOf(File)
    expect(onFileSelect.mock.calls[0][0].name).toBe('avatar.png')
  })

  it('показывает ошибку и блокирует выбор во время загрузки', () => {
    render(
      <AvatarInput
        value={undefined}
        onFileSelect={jest.fn()}
        isLoading
        error="Не удалось загрузить аватар"
      />,
    )

    expect(screen.getByText('Не удалось загрузить аватар')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Загрузка аватара' })).toHaveProperty(
      'disabled',
      true,
    )
  })

  it('показывает превью по URL', () => {
    render(
      <AvatarInput
        value="/uploads/avatar.png"
        onFileSelect={jest.fn()}
      />,
    )

    const image = screen.getByAltText('Аватар') as HTMLImageElement
    expect(image.getAttribute('src')).toBe('/uploads/avatar.png')
  })
})
