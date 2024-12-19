import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getSharedContent, uploadFiles } from '@/lib/api'
import { UploadData } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Search, Copy, Download, FileText, Image as ImageIcon, Archive, FileIcon, Lock, X, Trash2 } from 'lucide-react'

export default function send0() {
  const navigate = useNavigate()
  const location = useLocation()
  const [nameInput, setNameInput] = useState('')
  const [password, setPassword] = useState('')
  const [isPasscode, setIsPasscode] = useState(false)
  const [content, setContent] = useState<UploadData | null>(null)
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [expiryTime, setExpiryTime] = useState('300')
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'files'>('text')
  const [isSearched, setIsSearched] = useState(false)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [progressValue, setProgressValue] = useState(0)
  const [dofetchContent, setDoFetchContent] = useState(false)
  const handleClearText = () => {
    setText('')
  }

  const handleClearFiles = () => {
    setFiles([])
  }

  useEffect(() => {
    const path = location.pathname.slice(1)

    if (path) {
      setNameInput(path)
      setDoFetchContent(true)
    }
  }, [])

  useEffect(() => {
    if (dofetchContent) {
      fetchContent()
      setDoFetchContent(false)
    }
  }, [nameInput])

  const fetchContent = async (password?: string) => {
    if (nameInput) {
      setLoading(true)
      const res = await getSharedContent(nameInput, password)
      if (res.success) {
        setContent(res.data as UploadData)
        setIsSearched(true)
      } else {
        if (res.statusCode === 401) {
          setIsPasswordDialogOpen(true)
        } else {
          setContent(null)
          setIsSearched(true)
          if (res.statusCode === 404) {
            toast({
              title: 'Content Not Found',
              description: `No content found for "${nameInput}". You can create new content using this name.`,
              variant: 'default',
            })
          } else {
            toast({
              title: 'Error',
              description: res.message,
              variant: 'destructive',
            })
          }
        }
      }
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/${encodeURIComponent(nameInput)}`)
    handleClearFiles()
    handleClearText()
    fetchContent()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files || [])])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setProgressValue(33)
      const response = await uploadFiles({
        name: nameInput,
        text,
        password,
        hasPassword: isPasscode,
        files,
        expiryTime: parseInt(expiryTime)
      })
      setProgressValue(100)
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Content uploaded successfully',
        })
        setContent(response.data as UploadData)
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        })
      }
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchContent(password)
    setIsPasswordDialogOpen(false)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />
      case 'png':
        return <ImageIcon className="w-5 h-5 text-green-500" />
      case 'jpg':
        return <ImageIcon className="w-5 h-5 text-green-500" />
      case 'jpeg':
        return <ImageIcon className="w-5 h-5 text-green-500" />
      case 'gif':
        return <ImageIcon className="w-5 h-5 text-green-500" />
      case 'zip':
        return <Archive className="w-5 h-5 text-yellow-500" />
      case 'rar':
        return <Archive className="w-5 h-5 text-yellow-500" />
      default:
        return <FileIcon className="w-5 h-5 text-blue-500" />
    }
  }


  const handleCopyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy)
    toast({
      title: 'Copied',
      description: 'Content copied to clipboard',
    })
  }


  const renderHomeContent = function () {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-light text-gray-800">How to use cl1p.in</h2>
        <p className="text-gray-600">
          1. Enter a unique name for your clip in the search bar.
        </p>
        <p className="text-gray-600">
          2. Click "GO" to create a new clip or access an existing one.
        </p>
        <p className="text-gray-600">
          3. Add text or files to your clip.
        </p>
        <p className="text-gray-600">
          4. Set an expiry time and optional password.
        </p>
        <p className="text-gray-600">
          5. Click "cl1p.in" to save and share your content.
        </p>
      </div>
    )
  }

  return (
    <div className="font-mono text-gray-800 flex flex-col min-h-screen bg-white bg-grid-gray-200">
      <div className="container mx-auto py-4 flex flex-col flex-grow">
        <div className="rounded-lg py-4 flex flex-col h-full">
          <h1 className="text-3xl font-light mb-6 text-center text-gray-800">cl1p.in</h1>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
            <div className="relative flex-grow w-full">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter clip name..."
                className="pl-10 pr-4 py-2 bg-transparent text-gray-800 rounded-md w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            <Button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white rounded-md px-6 w-full sm:w-auto">GO</Button>
          </form>

          {(!isSearched || (isSearched && !nameInput)) ? (
            renderHomeContent()
          ) : (
            <>
              {!content && (
                <>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
                    <Button
                      onClick={() => setActiveTab('text')}
                      className={`flex-1 ${activeTab === 'text' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                    >
                      Text
                    </Button>
                    <Button
                      onClick={() => setActiveTab('files')}
                      className={`flex-1 ${activeTab === 'files' ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                    >
                      Files
                    </Button>
                  </div>

                  <div className="flex-grow bg-white h-[30rem] rounded-lg py-4 overflow-hidden shadow-inner">
                    {activeTab === 'text' ? (
                      <div className="h-full flex flex-col">
                        <Textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Enter Your text..."
                          className="w-full flex-grow resize-none bg-transparent text-gray-800 rounded-md"
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <Button
                            onClick={() => handleCopyToClipboard(text)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                          >
                            <Copy className="w-4 h-4 mr-2" /> Copy
                          </Button>
                          <Button
                            onClick={handleClearText}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Clear
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col">
                        <Input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="mb-4 bg-transparent text-gray-800 rounded-md file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                        />
                        {files.length > 0 && (
                          <div className="overflow-y-auto flex-grow" style={{ maxHeight: 'calc(100% - 80px)' }}>
                            <ul className="space-y-2">
                              {files.map((file, index) => (
                                <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                                  <div className="flex items-center space-x-2">
                                    {getFileIcon(file.name)}
                                    <span className="truncate">{file.name}</span>
                                  </div>
                                  <Button
                                    onClick={() => handleRemoveFile(index)}
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-100"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex justify-end space-x-2 mt-2">
                          <Button
                            onClick={handleClearFiles}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Clear All
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPasscode"
                        checked={isPasscode}
                        onCheckedChange={(checked) => setIsPasscode(checked as boolean)}
                      />
                      <Label htmlFor="isPasscode" className="text-sm text-gray-600 flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Protect with passcode
                      </Label>
                    </div>
                    {isPasscode && (
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Passcode"
                        className="bg-transparent text-gray-800 rounded-md"
                      />
                    )}
                    <Select value={expiryTime} onValueChange={setExpiryTime}>
                      <SelectTrigger className="w-full bg-transparent text-gray-800 rounded-md">
                        <SelectValue placeholder="Expiry Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 min</SelectItem>
                        <SelectItem value="300">5 mins</SelectItem>
                        <SelectItem value="3600">1 hours</SelectItem>
                        <SelectItem value="43200">12 hours</SelectItem>
                        <SelectItem value="86400">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {loading ? (
                    <Progress value={progressValue} className="w-full mt-4" />
                  ) : (
                    <Button
                      onClick={handleUpload}
                      className="w-full mt-4  bg-gray-800 hover:bg-gray-700 text-white rounded-md"
                    >
                      cl1p.in
                    </Button>
                  )}
                </>
              )}


              {content && (
                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">Shared Content</h2>
                  {content.files && content.files.length > 0 && (
                    <div className='mb-4'>
                      <ul className="space-y-2">
                        {content.files.map((file, index) => (
                          <li key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                            {getFileIcon(file.name)}
                            <span className="truncate text-gray-800">{file.name}</span>
                            <Button
                              asChild
                              variant="ghost"
                              className="text-gray-600 hover:text-gray-800"
                            >
                              <a href={file.presignedUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-5 h-5" />
                              </a>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {content.text && (
                    <div className="mb-4 flex flex-col gap-2 ">
                      <Button
                        onClick={() => handleCopyToClipboard(content.text)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                      >
                        <Copy className="w-4 h-4 mr-2" /> Copy
                      </Button>
                      <Textarea
                        value={content.text}
                        placeholder="Enter Your text..."
                        className="w-full h-[30rem] flex-grow resize-none bg-transparent text-gray-800 rounded-md"
                      />
                    </div>
                  )}

                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white text-gray-800 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Password Required</DialogTitle>
            <DialogDescription className="text-gray-600">
              This content is password protected. Please enter the password to view it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passwordInput" className="text-sm text-gray-600">Password</Label>
                <Input
                  id="passwordInput"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-gray-800 rounded-md"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white rounded-md">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}