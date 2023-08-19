import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

test('renders learn react link', () => {
    render(<App />)
    const button1 = screen.getByText('9')
    const button2 = screen.getByText('×')
    fireEvent.click(button1)
    fireEvent.click(button2)
    fireEvent.click(button1)
    const result = screen.getByText('81')
    expect(result).toBeInTheDocument()
})
