import React from 'react';

const SubmissionResults = ({ result }) => {
    if (!result) return null;
    
    const { passed, evaluation } = result;
    
    return (
        <div className={`p-4 rounded-lg ${
            passed ? 'bg-green-900 bg-opacity-20 border border-green-500' : 
                   'bg-red-900 bg-opacity-20 border border-red-500'
        }`}>
            <h3 className={`text-lg font-bold ${passed ? 'text-green-400' : 'text-red-400'} mb-2`}>
                {passed ? 'All Tests Passed! 🎉' : 'Some Tests Failed'}
            </h3>
            
            {evaluation && (
                <>
                    <p className="text-gray-300 mb-4">{evaluation.feedback}</p>
                    
                    <div className="space-y-3">
                        {evaluation.results.map((result, index) => (
                            <div key={index} className={`p-3 rounded ${
                                result.passed ? 'bg-green-900 bg-opacity-30' : 'bg-red-900 bg-opacity-30'
                            }`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-gray-300">Test Case {result.testCase}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        result.passed ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                        {result.passed ? 'PASSED' : 'FAILED'}
                                    </span>
                                </div>
                                <div className="text-gray-400">Expected: <span className="text-white font-mono">{result.expected}</span></div>
                                <div className="text-gray-400">Actual: <span className={`font-mono ${
                                    result.passed ? 'text-green-400' : 'text-red-400'
                                }`}>{result.actual}</span></div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SubmissionResults;
