function Home() {
  return (
    <div className="flex justify-center items-center bg-background h-screen">
      <div className='text-white text-center'>
        <a href="http://localhost:8080/api/auth/google?state=/dashboard">
            <span className="border-1 border-gray-600 rounded-2xl p-5">Login with Google</span>
        </a>
      </div>
    </div>
  );
};

export default Home;
