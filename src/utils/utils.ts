import { ElMessage } from 'element-plus'

function getType(obj: any): string {
  type TypeMap = {
    [property: string]: string
  }
  const map: TypeMap = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  }
  if (obj instanceof Element) {
    return 'element'
  }
  return map[Object.prototype.toString.call(obj)] || 'unknown'
}

/**
 * 深拷贝对象
 * @param target 深拷贝对象
 * @returns 深拷贝结果
 */
export function deepClone(target: any, stack?: WeakMap<any, any>) {
  const type = getType(target)
  if (type === 'array' || type === 'object') {
    // 检查循环引用并返回其对应的克隆
    stack || (stack = new WeakMap())
    const stacked = stack.get(target)
    if (stacked) {
      return stacked
    }
    // 复杂数据类型 递归实现
    //
    if (type === 'array') {
      const _clone: Array<any> = []
      target.forEach((element: any) => {
        _clone.push(deepClone(element, stack))
      })
      stack.set(target, _clone)
      return _clone
    }
    if (type === 'object') {
      type TypeClone = {
        [property: string]: any
      }
      const _clone: TypeClone = {}
      for (const key in target) {
        if (Object.hasOwnProperty.call(target, key)) {
          const element = target[key]
          _clone[key] = deepClone(element, stack)
        }
      }
      stack.set(target, _clone)
      return _clone
    }
  } else {
    // 基础数据类型 直接返回
    //
    return target
  }
}

/**
 * 显示提示框
 * @param msg 提示信息
 * @param type 提示类型（默认error）
 * @param duration 提示时长（默认3000(ms)）
 */
export function message(msg: string, type?: string, duration?: number) {
  type = type || 'error'
  duration = duration || (type === 'error' ? 4000 : 3000)
  switch (type) {
    case 'error':
    case 'success':
    case 'info':
    case 'warning':
      ElMessage({
        message: msg,
        type: type,
        duration: duration
      })
      break
    default:
      throw new Error(`不支持的type:${type}`)
  }
}

/**
 * 防抖函数
 * @param func 待执行的函数
 * @param delay 防抖时间 200
 * @returns Function
 */
export function debounce<T extends (...args: any[]) => void>(func: T, delay: number = 200): T {
  let timerId: NodeJS.Timeout | null = null
  return function (this: ThisParameterType<T>, ...args: any[]) {
    if (timerId) {
      clearTimeout(timerId)
    }
    timerId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  } as T
}

/**
 * 节流函数
 * @param func 待执行的函数
 * @param delay 节流时间
 * @returns Function
 */
export function throttle<T extends (...args: any[]) => void>(func: T, delay: number = 200): T {
  let timerId: NodeJS.Timeout | null = null
  let lastExecutedTime = 0
  return function (this: ThisParameterType<T>, ...args: any[]) {
    const currentTime = Date.now()
    const timeSinceLastExecution = currentTime - lastExecutedTime
    if (timeSinceLastExecution >= delay) {
      func.apply(this, args)
      lastExecutedTime = currentTime
    } else {
      if (timerId) {
        clearTimeout(timerId)
      }
      timerId = setTimeout(() => {
        func.apply(this, args)
        lastExecutedTime = Date.now()
      }, delay - timeSinceLastExecution)
    }
  } as T
}

/**
 * 随机字符串生成函数生成器
 * - 闭包存储map
 * @param characters_ 可选的字符
 * @returns 随机字符串生成函数
 */
export function generateRandomStringBase(characters_?: string) {
  const idMap = new Map()
  idMap.set('', true)
  return function (length = 10) {
    let result = ''
    const length_ = length
    const characters =
      characters_ || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const charactersLength = characters.length

    while (idMap.get(result) === true) {
      for (let i = 0; i < length_; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
    }
    idMap.set(result, true)

    return result
  }
}

type TypeConvertSource = { [property: string]: any } | Array<any>
/**
 * 将对象全部的key都转成小驼峰
 * @param obj 对象
 * @returns 对象
 */
export function convertKeysToCamelCase(obj: TypeConvertSource, save?: boolean) {
  save = save === undefined ? false : save
  const convertKey = (key: string) => {
    return key.replace(/_([a-zA-Z0-9])/g, (match, letter) => letter.toUpperCase())
  }

  const convertObject = (source: TypeConvertSource) => {
    const isArray = Array.isArray(source)
    if (isArray) {
      const result: Array<any> = []
      for (let i = 0; i < source.length; i++) {
        result[i] = convertObject(source[i])
      }
      return result
    } else {
      const result: { [property: string]: any } = {}
      Object.keys(source).forEach((key: string) => {
        const camelCaseKey = convertKey(key)
        const value = source[key]
        if (value && typeof value === 'object') {
          result[camelCaseKey] = convertObject(value)
        } else {
          result[camelCaseKey] = value
        }
        // 保留原key
        if (save) result[key] = value
      })
      return result
    }
  }

  return convertObject(obj)
}

/**
 * 将对象全部的key都转成下划线命名法
 * @param obj 对象
 * @returns 对象
 */
export function convertKeysToSnakeCase(obj: TypeConvertSource) {
  const convertKey = (key: string) => {
    key = key.replace(/([A-Z]{2,})/g, (match, letter) => `_${letter}`)
    key = key.replace(/[^_A-Z]([A-Z])/g, (match, letter) => match[0] + `_${letter.toLowerCase()}`)
    key = key.replace(/([0-9]+)/g, (match, letter) => `_${letter}`)
    if (key[0] === '_') key = key.slice(1)
    return key
  }

  const convertObject = (source: TypeConvertSource) => {
    if (Array.isArray(source)) {
      const result: Array<any> = []
      source.forEach((item) => {
        if (item && typeof item === 'object') {
          result.push(convertObject(item))
        } else {
          result.push(item)
        }
      })
      return result
    } else {
      const result: { [property: string]: any } = {}
      Object.keys(source).forEach((key) => {
        const snakeCaseKey = convertKey(key)
        const value = source[key]
        if (value && typeof value === 'object') {
          result[snakeCaseKey] = convertObject(value)
        } else {
          result[snakeCaseKey] = value
        }
      })
      return result
    }
  }

  return convertObject(obj)
}

/**
 * window scroll to top
 * @param instant 是否是instant，false为smooth
 */
export function scrollToTop(instant = true) {
  window.scrollTo({
    top: 0,
    behavior: instant ? 'instant' : 'smooth'
  })
}

/**
 * 判断是否是Object
 * @param value 待判定对象
 * @returns 是否是Object
 */
export function isObject(value: any) {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.prototype.toString.call(value) === '[object Object]'
  )
}

/**
 * 概率函数
 * @param a 分子
 * @param b 分母
 * @returns 在概率(a/b)下，本次运行是否触发
 */
export function probability(a: number, b: number): boolean {
  if (a <= 0 || b <= 0) {
    throw new Error('输入的a和b必须大于0')
  }
  const random = Math.random()
  return random < a / b
}

/**
 * 判断是否在时间区间内部
 * @param timePeriods 时间区间数据
 * @returns 是否在时间区间内部
 */
export function isInTimeInterval(timePeriods: Array<[number, number]>): boolean {
  // 获取当前时间
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  // 将当前时间转换为分钟
  const currentMinutes = hours * 60 + minutes

  // 遍历时间区间列表
  for (const [start, end] of timePeriods) {
    // 将时间区间的开始和结束时间转换为分钟
    const startMinutes = start * 60
    const endMinutes = end === 24 ? 24 * 60 : end * 60 // 如果结束时间是24，转换为1440

    // 检查当前时间是否在时间区间内
    // 如果当前时间大于等于开始时间，并且小于结束时间
    if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return true
    }
  }

  // 如果当前时间不在任何时间区间内，返回false
  return false
}

/**
 * 创建一个连点校验函数
 * @param time 点击最大间隔时间
 * @param amount 点击次数
 * @returns 触发函数
 */
export function createQuickClickJudge(time = 400, amount = 5) {
  let now = 0
  let timer: NodeJS.Timeout | null = null
  return function <T extends (...args: any[]) => void>(func: T) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      now = 0
    }, time)
    now++
    if (now >= amount) {
      func()
    }
  }
}
