const router = createBrowserRouter(
  createRoutesFromElements(
    <Route exact path='/' element={<RequireAuth><Home /></RequireAuth>} >
      <Route exact path='rooms/:roomId' element={<RequireAuth> <Chat /></RequireAuth>} />
    </Route>
  ),
  createRoutesFromElements(

    <Route exact path='/signin' element={<SignIn />} />

  )
)