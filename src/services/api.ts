// Simple API adapter: switches between localStorage fallback and REST endpoints.
const API_BASE = import.meta.env.VITE_API_BASE || ''

function useRest() {
  async function post(path:string, body:any){
    const res = await fetch(API_BASE + path, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
    if(!res.ok) throw new Error(await res.text())
    return res.json()
  }
  async function get(path:string){
    const res = await fetch(API_BASE + path)
    if(!res.ok) throw new Error(await res.text())
    return res.json()
  }
  return { post, get }
}

function useLocal(){
  return {
    async register(email:string, password:string){
      const users = JSON.parse(localStorage.getItem('collab_users')||'[]')
      if(users.find((u:any)=>u.email===email)) throw new Error('email exists')
      const id = 'u_'+Date.now()
      users.push({ id, email, password })
      localStorage.setItem('collab_users', JSON.stringify(users))
      return { id, email }
    },
    async login(email:string, password:string){
      const users = JSON.parse(localStorage.getItem('collab_users')||'[]')
      const found = users.find((u:any)=>u.email===email && u.password===password)
      if(!found) throw new Error('invalid credentials')
      return { id: found.id, email: found.email }
    },
    async resetPassword(email:string){
      const users = JSON.parse(localStorage.getItem('collab_users')||'[]')
      if(!users.find((u:any)=>u.email===email)) throw new Error('not found')
      return { ok:true }
    }
  }
}

const useApi = API_BASE ? useRest() : useLocal()

export default useApi
