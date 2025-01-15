'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Volume2, VolumeX, Check, Trash2, Settings, BarChart, Play, Pause, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

type TimerMode = 'work' | 'break' | 'long-break'
type TaskCategory = 'work' | 'personal' | 'study' | 'other'
type TaskPriority = 'low' | 'medium' | 'high'
type Task = { 
  id: string
  text: string
  completed: boolean
  category: TaskCategory
  priority: TaskPriority
}

type TimerSettings = {
  work: number
  break: number
  longBreak: number
}

export default function PomodoroTaskTimer() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState('')
  const [currentCategory, setCurrentCategory] = useState<TaskCategory>('work')
  const [currentPriority, setCurrentPriority] = useState<TaskPriority>('medium')
  const [time, setTime] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<TimerMode>('work')
  const [sessions, setSessions] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSoundOn, setIsSoundOn] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    work: 25,
    break: 5,
    longBreak: 15
  })
  const [showStats, setShowStats] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showTaskList, setShowTaskList] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0) {
      if (isSoundOn && audioRef.current) {
        audioRef.current.play()
      }
      if (mode === 'work') {
        setCompletedPomodoros((prev) => prev + 1)
        setSessions((prev) => prev + 1)
        if (sessions === 3) {
          setMode('long-break')
          setTime(timerSettings.longBreak * 60)
        } else {
          setMode('break')
          setTime(timerSettings.break * 60)
        }
      } else {
        setMode('work')
        setTime(timerSettings.work * 60)
        if (mode === 'long-break') {
          setSessions(0)
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, time, mode, sessions, isSoundOn, timerSettings])

  const toggleTimer = useCallback(() => {
    setIsActive(!isActive)
  }, [isActive])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    setTime(timerSettings.work * 60)
    setMode('work')
    setSessions(0)
  }, [timerSettings.work])

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentTask.trim()) {
      setTasks([...tasks, { 
        id: Date.now().toString(), 
        text: currentTask, 
        completed: false,
        category: currentCategory,
        priority: currentPriority
      }])
      setCurrentTask('')
    }
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const removeTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn)
  }

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      toggleTimer()
    } else if (event.code === 'KeyR') {
      resetTimer()
    }
  }, [toggleTimer, resetTimer])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <audio ref={audioRef} src="/notification.mp3" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`rounded-2xl shadow-2xl p-8 w-full max-w-md transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800 shadow-gray-700/50' : 'bg-white shadow-gray-200/50'
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Pomodoro Timer</h1>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSound}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isSoundOn ? 'bg-green-500 text-white hover:bg-green-400' : 'bg-red-500 text-white hover:bg-red-400'
              }`}
            >
              {isSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Settings size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowStats(!showStats)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <BarChart size={20} />
            </motion.button>
          </div>
        </div>
        
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-6 p-4 rounded-md overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Timer Settings (minutes)</h2>
              <div className="flex justify-between space-x-2">
                {Object.entries(timerSettings).map(([key, value]) => (
                  <div key={key} className="flex flex-col items-center">
                    <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{key}</label>
                    <input 
                      type="number" 
                      value={value} 
                      onChange={(e) => setTimerSettings({...timerSettings, [key]: parseInt(e.target.value)})}
                      className={`w-16 p-1 mt-1 rounded ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'}`}
                      min="1"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-6 p-4 rounded-md overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Productivity Stats</h2>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Completed Pomodoros: {completedPomodoros}</p>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Completed Tasks: {tasks.filter(task => task.completed).length}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          className={`text-8xl font-bold text-center mb-8 ${
            mode === 'work' ? 'text-blue-500' : mode === 'break' ? 'text-green-500' : 'text-purple-500'
          }`}
          key={time}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatTime(time)}
        </motion.div>

        <div className="flex justify-center space-x-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-full text-white font-semibold transition-colors duration-200 flex items-center justify-center ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
            <span className="ml-2">{isActive ? 'Pause' : 'Start'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className={`px-8 py-3 rounded-full font-semibold transition-colors duration-200 flex items-center justify-center ${
              isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <RotateCcw size={24} />
            <span className="ml-2">Reset</span>
          </motion.button>
        </div>

        <motion.div 
          className={`text-center mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Session: {sessions + 1} / 4
        </motion.div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Tasks</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowTaskList(!showTaskList)}
              className={`p-1 rounded-full transition-colors duration-200 ${
                isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {showTaskList ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </motion.button>
          </div>
          <AnimatePresence>
            {showTaskList && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <form onSubmit={addTask} className="mb-4">
                  <div className="flex flex-col space-y-2">
                    <motion.input
                      type="text"
                      value={currentTask}
                      onChange={(e) => setCurrentTask(e.target.value)}
                      placeholder="Add a task..."
                      className={`w-full p-3 rounded-md focus:outline-none transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white border-gray-600 focus:bg-gray-600' 
                          : 'bg-gray-100 text-gray-800 border-gray-200 focus:bg-white'
                      }`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="flex space-x-2">
                      <motion.select
                        value={currentCategory}
                        onChange={(e) => setCurrentCategory(e.target.value as TaskCategory)}
                        className={`flex-1 p-2 rounded-md ${
                          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="study">Study</option>
                        <option value="other">Other</option>
                      </motion.select>
                      <motion.select
                        value={currentPriority}
                        onChange={(e) => setCurrentPriority(e.target.value as TaskPriority)}
                        className={`flex-1 p-2 rounded-md ${
                          isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </motion.select>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                    >
                      Add Task
                    </motion.button>
                  </div>
                </form>

                <AnimatePresence>
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center justify-between p-4 rounded-md mb-3 ${
                        isDarkMode 
                          ? 'bg-gray-700 text-white hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } ${task.completed ? 'opacity-60' : ''} transition-colors duration-200`}
                    >
                      <div className="flex items-center space-x-2 flex-grow">
                        <span className={`flex-grow ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
                        <motion.span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            task.category === 'work' ? 'bg-blue-500' :
                            task.category === 'personal' ? 'bg-green-500' :
                            task.category === 'study' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          } text-white`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {task.category}
                        </motion.span>
                        <motion.span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'high' ? 'bg-red-500' :
                            task.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          } text-white`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                        >
                          {task.priority}
                        </motion.span>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleTaskCompletion(task.id)}
                          className={`p-2 rounded-full transition-colors duration-200 ${
                            task.completed 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : isDarkMode 
                                ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          <Check size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeTask(task.id)}
                          className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

