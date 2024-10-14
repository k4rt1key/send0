'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
import { Search, Copy, Download, FileText, Image as ImageIcon, Archive, FileIcon, Lock } from 'lucide-react'

export default function Component() {
  const { name } = useParams<{ name?: string }>()
  const [nameInput, setNameInput] = useState(name || '')
  const [password, setPassword] = useState('')
  const [isPasscode, setIsPasscode] = useState(false)
  const [content, setContent] = useState<UploadData | null>(null)
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [expiryTime, setExpiryTime] = useState('24')
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'text' | 'files'>('text')
  const [isSearched, setIsSearched] = useState(false)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [progressValue, setProgressValue] = useState(0)

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

  useEffect(() => {
    if (name) {
      setNameInput(name)
      fetchContent()
    }
  }, [name])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchContent()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
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
        return <FileText className="w-5 h-5 text-red-400" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <ImageIcon className="w-5 h-5 text-green-400" />
      case 'zip':
      case 'rar':
        return <Archive className="w-5 h-5 text-yellow-400" />
      default:
        return <FileIcon className="w-5 h-5 text-blue-400" />
    }
  }

  const handleDownloadAll = () => {
    content?.files.forEach(file => {
      window.open(file.presignedUrl, '_blank')
    })
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content?.text || '')
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard',
    })
  }

  return (
    <>
        <div className="hidden md:flex font-2 text-gray-100 flex-col min-h-screen">
          <div className="container mx-auto p-4 sm:p-6 flex flex-col flex-grow">
            <h1 className="text-3xl sm:text-4xl font-1 font-light mb-6 sm:mb-8 text-center text-purple-300">Send0</h1>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row items-center space-x-2 mb-6 sm:mb-8">
              <div className="relative flex-grow">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter a name"
                  className="pl-10 pr-4 py-2 bg-transparent backdrop-blur-sm border-gray-700 text-gray-100 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <Button type="submit" className="bg-purple-600 bg-opacity-80 hover:bg-opacity-100 rounded-full px-6">Search</Button>
            </form>

            {isSearched && (
              <div className="flex flex-grow backdrop-blur-md bg-gray-800 bg-opacity-30 rounded-lg overflow-hidden">
                <div className="w-48 bg-gray-900 bg-opacity-50 p-4 flex md:flex-col space-y-2">
                  <Button
                    onClick={() => setActiveTab('text')}
                    className={`justify-start ${activeTab === 'text' ? 'bg-purple-600 bg-opacity-80 text-white' : 'bg-transparent text-gray-300 hover:text-white'}`}
                  >
                    <FileText className="mr-2 w-5 h-5" /> Text
                  </Button>
                  <Button
                    onClick={() => setActiveTab('files')}
                    className={`justify-start ${activeTab === 'files' ? 'bg-purple-600 bg-opacity-80 text-white' : 'bg-transparent text-gray-300 hover:text-white'}`}
                  >
                    <Archive className="mr-2 w-5 h-5" /> Files
                  </Button>
                </div>

                <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
                  {content ? (
                    <>
                      {activeTab === 'text' && content.text && (
                        <div className="relative h-full">
                          <Textarea
                            value={content.text}
                            readOnly
                            className="w-full h-[calc(100vh-300px)] resize-none bg-transparent backdrop-blur-sm border-gray-600 text-gray-100 rounded-lg p-4"
                          />
                          <Button
                            onClick={handleCopyToClipboard}
                            className="absolute top-4 right-8 bg-purple-600 bg-opacity-30 hover:bg-opacity-100 rounded-lg"
                          >
                            <Copy className="w-5 h-5" />
                          </Button>
                        </div>
                      )}
                      {activeTab === 'files' && content.files && content.files.length > 0 && (
                        <div className="h-full flex flex-col">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-light text-purple-300">Files</h3>
                            <Button
                              onClick={handleDownloadAll}
                              className="bg-purple-600 bg-opacity-80 hover:bg-opacity-100 rounded-full px-4"
                            >
                              Download All
                            </Button>
                          </div>
                          <ul className="space-y-2 overflow-y-auto flex-grow">
                            {content.files.map((file, index) => (
                              <li key={index} className="flex items-center justify-between bg-gray-700 bg-opacity-30 backdrop-blur-sm p-3 rounded-lg">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                  {getFileIcon(file.name)}
                                  <span className="truncate">{file.name}</span>
                                </div>
                                <Button
                                  asChild
                                  variant="ghost"
                                  className="text-purple-300 hover:text-purple-100 hover:bg-purple-800 hover:bg-opacity-50 rounded-full"
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
                    </>
                  ) : (
                    <form onSubmit={handleUpload} className="h-full flex flex-col">
                      {activeTab === 'text' && (
                        <div className="flex-grow mb-4">
                          <Label htmlFor="text" className="text-sm font-medium mb-2 block text-gray-300">Text</Label>
                          <Textarea
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Paste in anything you want."
                            className="w-full h-[calc(100vh-400px)] resize-none bg-transparent backdrop-blur-sm border-gray-600 text-gray-100 rounded-lg p-4"
                          />
                        </div>
                      )}
                      {activeTab === 'files' && (
                        <div className="flex-grow mb-4">
                          <Label htmlFor="files" className="text-sm font-medium mb-2 block text-gray-300">Files</Label>
                          <Input
                            id="files"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="bg-transparent backdrop-blur-sm border-gray-600 text-gray-100 rounded-lg file:text-gray-100 file:border-0 file:rounded-full file:cursor-pointer"
                          />
                          {files.length > 0 && (
                            <ul className="mt-4 px-2 space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto">
                              {files.map((file, index) => (
                                <li key={index} className="text-sm bg-gray-700 bg-opacity-30 backdrop-blur-sm p-2 rounded-lg flex items-center">
                                  {getFileIcon(file.name)}
                                  <span className="ml-2 truncate">{file.name}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                      <div className="space-y-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isPasscode"
                            checked={isPasscode}
                            onCheckedChange={(checked) => setIsPasscode(checked as boolean)}
                          />
                          <Label htmlFor="isPasscode" className="text-sm text-gray-300 flex items-center">
                            <Lock className="w-4 h-4 mr-2" />
                            Protect with passcode
                          </Label>
                        </div>
                        {isPasscode && (
                          <div>
                            <Label htmlFor="password" className="text-sm font-medium mb-2 block text-gray-300">Passcode</Label>
                            <Input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="bg-transparent backdrop-blur-sm border-gray-600 text-gray-100 rounded-lg"
                            />
                          </div>
                        )}
                        <div>
                          <Label htmlFor="expiryTime" className="text-sm font-medium mb-2 block text-gray-300">Expiry Time</Label>
                          <Select value={expiryTime} onValueChange={setExpiryTime}>
                            <SelectTrigger className="w-full bg-transparent backdrop-blur-sm border-gray-600 text-gray-100 rounded-lg">
                              <SelectValue placeholder="Select expiry time" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 font-2 text-gray-100">
                              <SelectItem value="1">1 hour</SelectItem>
                              <SelectItem value="2">2 hours</SelectItem>
                              <SelectItem value="4">4 hours</SelectItem>
                              <SelectItem value="6">6 hours</SelectItem>
                              <SelectItem value="12">12 hours</SelectItem>
                              <SelectItem value="24">24 hours</SelectItem>
                            
                            </SelectContent>
                          </Select>
                        </div>
                        {loading && <Progress value={progressValue} className="w-full" />}
                        {!loading && (
                          <Button type="submit" className="w-full bg-purple-600 bg-opacity-80 hover:bg-opacity-100 rounded-lg">Create Clip</Button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogContent className="md-down: hidden sm:max-w-[425px] bg-gray-800 bg-opacity-90 backdrop-blur-md text-gray-100 rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-purple-300">Password Required</DialogTitle>
                <DialogDescription className="text-gray-400">
                  This content is password protected. Please enter the password to view it.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordInput" className="text-sm text-gray-300">Password</Label>
                    <Input
                      id="passwordInput"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-transparent backdrop-blur-sm border-gray-600 text-gray-100 rounded-lg"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" className="bg-purple-600 bg-opacity-80 hover:bg-opacity-100 rounded-lg">Submit</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className='md:hidden text-white flex justify-center items-center h-screen'>
          Please use a desktop browser or use desktop mode in your mobile browser to access this page.
        </div>
    </>
  )
}