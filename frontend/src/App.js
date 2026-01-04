import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

function App() {
  // 使用键盘快捷键hook
  useKeyboardShortcuts();

  return (
    <div className="app">
      {/* 应用内容 */}
    </div>
  );
}

export default App;