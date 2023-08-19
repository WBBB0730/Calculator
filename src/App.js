import { useCallback, useEffect, useState } from 'react'
import './polyfills'
import './App.css'
import keyMap from './assets/keyMap'

/** 计算器按钮 */
function Button({ item, onClick }) {
    return (
        <div className={ 'button ' + (item === '=' ? 'confirm' : typeof item === 'number' ? 'num' : 'op') }
             onClick={ onClick }>
            { item }
        </div>
    )
}

export default function App() {
    const buttons = ['(', ')', '←', '÷', 7, 8, 9, '×', 4, 5, 6, '-', 1, 2, 3, '+', 'AC', 0, '.', '=']
    const [line, setLine] = useState('0')
    const [showResult, setShowResult] = useState(false)

    const symbols = getSymbols(line)
    const result = computeRes([...symbols])

    /** 处理点击事件 */
    const handleClick = useCallback((key) => {
        let tempLine = line
        if (showResult) {
            if (key !== '←') {
                if ('+-×÷'.includes(key)) {
                    if (Math.abs(result) > 999999999999999)
                        return
                    tempLine = result
                } else
                    tempLine = '0'
            }
            setShowResult(false)
        }

        const tempSymbols = getSymbols(tempLine)
        const lastSymbol = tempSymbols.at(-1)
        if (typeof key === 'number') {
            // 数字
            if (lastSymbol === ')' || lastSymbol.length >= 15)
                return
            setLine(lastSymbol === '0' ? tempLine.slice(0, -1) + key : tempLine + key)
        } else if (key === '.') {
            // 小数点
            if (lastSymbol === ')' || lastSymbol.length >= 15 || lastSymbol.includes('.'))
                return
            setLine(tempLine + '.')
        } else if ('+-×÷'.includes(key)) {
            // 运算符
            if (lastSymbol === '(' && key !== '-')
                return
            if (lastSymbol === '-' && tempSymbols.length >= 2 && tempSymbols.at(-2) === '(')
                return
            if (tempLine === '0' && key === '-')
                setLine(key)
            else
                setLine('+-×÷'.includes(lastSymbol) ? tempLine.slice(0, -1) + key : tempLine + key)
        } else if (key === '(') {
            // 左括号
            if (tempLine === '0')
                setLine(key)
            else if ('+-×÷('.includes(tempLine.at(-1)))
                setLine(tempLine + key)
        } else if (key === ')') {
            // 右括号
            if ('+-×÷('.includes(tempLine.at(-1)))
                return
            const ops = tempLine.split(/[0-9.]*/)
            let l = ops.filter(item => item === '(').length,
                r = ops.filter(item => item === ')').length
            if (l > r)
                setLine(tempLine + key)
        } else if (key === '=') {
            // 等号
            setShowResult(true)
        } else if (key === '←') {
            // 退格
            setLine(tempLine.length > 1 ? tempLine.slice(0, -1) : '0')
        } else if (key === 'AC') {
            // 清空
            setLine('0')
        }
    }, [line, result, showResult])

    useEffect(() => {
        /** 处理键盘事件 */
        function handleKeyDown(event) {
            if (event.key === 'Escape')
                setShowResult(false)
            else if ('0123456789'.includes(event.key))
                handleClick(parseInt(event.key))
            else if (keyMap[event.key])
                handleClick(keyMap[event.key])
            else if ('+-().='.includes(event.key))
                handleClick(event.key)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleClick])


    return (
        <div className="calculator">
            <div className={ 'line ' + (showResult ? 'extra' : 'main') }
                 onClick={ () => setShowResult(false) }>
                { symbols.join(' ') }
            </div>

            <div className={ 'res ' + (showResult ? 'main' : 'extra') }>{
                result !== null ?
                    Math.abs(result) > 999999999999999 ? result.toExponential() : result :
                    showResult ? '错误' : ''
            }</div>

            <div className="buttons">{
                buttons.map(item => (
                    <Button key={ item } item={ item } onClick={ () => handleClick(item) } />
                ))
            }</div>
        </div>
    )
}

/** 读取并拆分标识符 */
function getSymbols(line) {
    const symbols = []
    let start = 0
    for (let i = 0; i < line.length; i++) {
        if (/^[\d.]$/.test(line[i]))
            continue
        if (line[i] === '-' && (i === 0 || line[i - 1] === '('))
            continue
        if (start < i)
            symbols.push(line.slice(start, i))
        symbols.push(line[i])
        start = i + 1
    }
    if (start < line.length)
        symbols.push(line.slice(start))
    return symbols
}

/** 计算结果 */
function computeRes(symbols) {
    const nums = [], ops = []

    function getOpLevel(op) {
        if (op === '(')
            return 0
        if (op === '+' || op === '-')
            return 1
        return 2
    }

    function calc(op) {
        if (nums.length < 2)
            return null
        const num2 = nums.pop(), num1 = nums.pop()
        switch (op) {
            case '+':
                return num1 + num2
            case '-':
                return num1 - num2
            case '×':
                return num1 * num2
            case '÷':
                return num1 / num2
            default:
                return null
        }
    }

    const l = symbols.filter(item => item === '(').length, r = symbols.filter(item => item === ')').length
    if (r < l)
        for (let i = 0; i < l - r; i++)
            symbols.push(')')

    for (const symbol of symbols) {
        if ('+-×÷'.includes(symbol)) {
            let i = ops.length - 1
            while (i >= 0 && ops[i] !== '(' && getOpLevel(ops[i]) >= getOpLevel(symbol)) {
                const res = calc(ops.pop())
                if (res === null)
                    return null
                nums.push(res)
                i--
            }
            ops.push(symbol)
        } else if (symbol === '(') {
            ops.push(symbol)
        } else if (symbol === ')') {
            let i = ops.length - 1
            while (i >= 0 && ops[i] !== '(') {
                const res = calc(ops.pop())
                if (res === null)
                    return null
                nums.push(res)
                i--
            }
            if (i < 0)
                return null
            ops.pop()
        } else {
            const num = parseFloat(symbol)
            if (isNaN(num))
                return null
            nums.push(num)
        }
    }
    while (ops.length) {
        const res = calc(ops.pop())
        if (res === null)
            return null
        nums.push(res)
    }
    if (nums.length !== 1)
        return null
    return nums[0]
}
