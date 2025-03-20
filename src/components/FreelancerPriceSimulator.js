import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './FreelancerPriceSimulator.css';

const FreelancerPriceSimulator = () => {
  const [initialPrice, setInitialPrice] = useState(1000);
  const [newPrice, setNewPrice] = useState(1950);
  const [potentialProjectsPerYear, setPotentialProjectsPerYear] = useState(15);
  const [currentConversionRate, setCurrentConversionRate] = useState(50);
  const [newConversionRate, setNewConversionRate] = useState(80);
  const [yearlyRequestGrowth, setYearlyRequestGrowth] = useState(10);
  const [yearlyPriceGrowth, setYearlyPriceGrowth] = useState(5);
  const [yearlyConversionGrowth, setYearlyConversionGrowth] = useState(2);
  const [priceIncrease, setPriceIncrease] = useState(95);
  const [comparisons, setComparisons] = useState([]);
  
  // Flag to prevent update loops
  const isUpdatingPrice = useRef(false);
  const isUpdatingPercentage = useRef(false);
  const isUpdatingInitialPrice = useRef(false);
  
  // Transform data for the revenue chart
  const prepareChartData = () => {
    return comparisons.map(item => ({
      year: `Anno ${item.year}`,
      vecchiaStrategia: item.oldRevenue,
      nuovaStrategia: item.newRevenue
    }));
  };
  
  // Update percentage whenever new price OR initial price changes
  useEffect(() => {
    if (initialPrice > 0) {
      const calcIncrease = ((newPrice / initialPrice) - 1) * 100;
      // Only update if we're not currently sliding the percentage
      if (!isUpdatingPercentage.current) {
        setPriceIncrease(Math.round(calcIncrease * 100) / 100);
      }
    }
  }, [newPrice, initialPrice]);
  
  // Update new price when percentage changes
  useEffect(() => {
    // Only update if we're directly changing the percentage
    if (isUpdatingPercentage.current) {
      const calculatedNewPrice = Math.round(initialPrice * (1 + priceIncrease / 100));
      setNewPrice(calculatedNewPrice);
    }
  }, [priceIncrease, initialPrice]);
  
  // Calculate impact of price change
  const calculateImpact = () => {
    const projections = [];
    let cumulativeOld = 0;
    let cumulativeNew = 0;
    
    let currentYear = {
      potentialProjects: potentialProjectsPerYear,
      conversionRate: currentConversionRate,
      price: initialPrice
    };
    
    let newYear = {
      potentialProjects: potentialProjectsPerYear,
      conversionRate: newConversionRate,
      price: newPrice
    };
    
    for (let year = 1; year <= 5; year++) {
      const currentProjects = currentYear.potentialProjects * (currentYear.conversionRate / 100);
      const currentYearlyRevenue = currentProjects * currentYear.price;
      const currentMonthlyRevenue = currentYearlyRevenue / 12;
      
      const newProjects = newYear.potentialProjects * (newYear.conversionRate / 100);
      const newYearlyRevenue = newProjects * newYear.price;
      const newMonthlyRevenue = newYearlyRevenue / 12;
      
      cumulativeOld += currentYearlyRevenue;
      cumulativeNew += newYearlyRevenue;
      
      const difference = newYearlyRevenue - currentYearlyRevenue;
      const monthlyDifference = difference / 12;
      const percentageDifference = currentYearlyRevenue !== 0 ? 
        (difference / currentYearlyRevenue) * 100 : 0;
      
      projections.push({
        year,
        potentialProjectsCurrent: currentYear.potentialProjects,
        potentialProjectsNew: newYear.potentialProjects,
        currentProjects,
        newProjects,
        currentPrice: currentYear.price,
        newPrice: newYear.price,
        currentConversionRate: currentYear.conversionRate,
        newConversionRate: newYear.conversionRate,
        oldRevenue: currentYearlyRevenue,
        newRevenue: newYearlyRevenue,
        currentMonthlyRevenue,
        newMonthlyRevenue,
        monthlyDifference,
        difference,
        percentageDifference,
        cumulativeOld,
        cumulativeNew,
        cumulativeDifference: cumulativeNew - cumulativeOld
      });
      
      currentYear = {
        potentialProjects: currentYear.potentialProjects * (1 + yearlyRequestGrowth / 100),
        conversionRate: Math.min(100, currentYear.conversionRate * (1 + yearlyConversionGrowth / 100)),
        price: currentYear.price * (1 + yearlyPriceGrowth / 100)
      };
      
      newYear = {
        potentialProjects: newYear.potentialProjects * (1 + yearlyRequestGrowth / 100),
        conversionRate: Math.min(100, newYear.conversionRate * (1 + yearlyConversionGrowth / 100)),
        price: newYear.price * (1 + yearlyPriceGrowth / 100)
      };
    }
    
    setComparisons(projections);
  };
  
  // Create a version of calculateImpact with a delay
  const calculateImpactWithDelay = () => {
    setTimeout(calculateImpact, 100);
  };
  
  // Calculate impact when inputs change
  useEffect(() => {
    calculateImpactWithDelay();
  }, [
    initialPrice, 
    newPrice, 
    potentialProjectsPerYear, 
    currentConversionRate, 
    newConversionRate, 
    yearlyRequestGrowth, 
    yearlyPriceGrowth, 
    yearlyConversionGrowth
  ]);
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(value);
  };
  
  // Calculated values
  const currentProjects = potentialProjectsPerYear * (currentConversionRate / 100);
  const newProjects = potentialProjectsPerYear * (newConversionRate / 100);
  const projectDifference = newProjects - currentProjects;
  const currentRevenue = currentProjects * initialPrice;
  const newRevenue = newProjects * newPrice;
  const revenueDifference = newRevenue - currentRevenue;
  const currentMonthlyRevenue = currentRevenue / 12;
  const newMonthlyRevenue = newRevenue / 12;
  const monthlyDifference = newMonthlyRevenue - currentMonthlyRevenue;
  const percentageDifference = (revenueDifference / currentRevenue * 100).toFixed(2);
  
  const handleNewPriceChange = (value) => {
    // Set flag that we're directly changing the price
    isUpdatingPrice.current = true;
    // Update price
    setNewPrice(value);
  };

  const handlePriceIncreaseChange = (value) => {
    // Set flag that we're directly changing the percentage
    isUpdatingPercentage.current = true;
    // Update percentage
    setPriceIncrease(value);
    // Clear the flag after a short delay
    setTimeout(() => {
      isUpdatingPercentage.current = false;
    }, 50);
  };
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-old">Vecchia Strategia: {formatCurrency(payload[0].value)}</p>
          <p className="tooltip-new">Nuova Strategia: {formatCurrency(payload[1].value)}</p>
          <p className="tooltip-diff">Differenza: {formatCurrency(payload[1].value - payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="calculator-container">
      {/* Header */}
      <div className="header">
        <h1 className="main-title">Simulatore Strategia di Pricing</h1>
        <p className="subtitle">
          Scopri l'impatto dell'aumento dei prezzi sui tuoi guadagni da freelance.
        </p>
      </div>
      
      <div className="parameters-container">
        <div className="parameters-header">
          Parametri di Base
        </div>
        
        <div className="parameters-content">
          {/* Potential projects */}
          <div className="form-group">
            <label className="form-label">
              Totale preventivi inviati all'anno
            </label>
            <input
              type="number"
              min="1"
              value={potentialProjectsPerYear}
              onChange={(e) => setPotentialProjectsPerYear(Number(e.target.value))}
              className="form-input"
            />
            <div className="slider-container">
              <input
                type="range"
                min="1"
                max="50"
                value={potentialProjectsPerYear}
                onChange={(e) => setPotentialProjectsPerYear(Number(e.target.value))}
                className="slider"
              />
            </div>
          </div>
          
          {/* Current situation */}
          <div className="section-divider">
            <h3 className="section-title">
              Situazione Attuale
            </h3>
            
            <div className="mobile-specific-grid">
              <div className="form-group">
                <label className="form-label">
                  Prezzo attuale (€) <span className='hidden'>Dummy Text Lalalala</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={initialPrice}
                  onChange={(e) => setInitialPrice(Number(e.target.value))}
                  className="form-input"
                />
                <div className="slider-container">
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={initialPrice}
                    onChange={(e) => setInitialPrice(Number(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Tasso di conversione attuale (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={currentConversionRate}
                  onChange={(e) => setCurrentConversionRate(Number(e.target.value))}
                  className="form-input"
                />
                <div className="slider-container">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={currentConversionRate}
                    onChange={(e) => setCurrentConversionRate(Number(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* New strategy */}
          <div className="section-divider">
            <h3 className="section-title">
              Nuova Strategia
            </h3>
            
            <div className="mobile-specific-grid">
              <div className="form-group">
                <label className="form-label">
                  Nuovo prezzo (€) <span className='hidden'>Dummy Text Lalalala</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={newPrice}
                  onChange={(e) => handleNewPriceChange(Number(e.target.value))}
                  className="form-input"
                />
                <div className="slider-container">
                  <input
                    type="range"
                    min="100"
                    max="20000"
                    step="100"
                    value={newPrice}
                    onChange={(e) => handleNewPriceChange(Number(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Nuovo tasso di conversione previsto (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newConversionRate}
                  onChange={(e) => setNewConversionRate(Number(e.target.value))}
                  className="form-input"
                />
                <div className="slider-container">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={newConversionRate}
                    onChange={(e) => setNewConversionRate(Number(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>
              
              <div className="form-group mobile-full-width">
                <label className="form-label">
                  Aumento (%)
                </label>
                <input
                  type="number"
                  min="-99"
                  max="1000"
                  value={priceIncrease}
                  onChange={(e) => handlePriceIncreaseChange(Number(e.target.value))}
                  className="form-input"
                />
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={priceIncrease}
                    onChange={(e) => handlePriceIncreaseChange(Number(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results */}
      <div className="results-container">
        <div className="results-header">
          IMPATTO NUOVA STRATEGIA DI PRICING
        </div>
        
        {/* Main Delta */}
        <div className="main-delta">
          <h3 className="result-title">
            QUANTO GUADAGNI IN PIÙ ALL'ANNO
          </h3>
          <div className="main-delta-value-container">
            <p className="main-delta-value">
              + {formatCurrency(revenueDifference)}
            </p>
          </div>
          <div className="result-subtitle-container">
            <p className="result-subtitle">
              Passi da {formatCurrency(currentRevenue)} a {formatCurrency(newRevenue)} all'anno
            </p>
          </div>
        </div>
        
        {/* Top Row - Before and After Annual */}
        <div className="results-grid">
          <div className="result-box">
            <h4 className="result-box-title">
              PRIMA FATTURAVI
            </h4>
            <div className="result-box-value-container">
              <p className="result-box-value">
                {formatCurrency(currentRevenue)}
              </p>
            </div>
            <div className="result-box-subtitle-container">
              <p className="result-box-subtitle">
                all'anno
              </p>
            </div>
          </div>
          
          <div className="result-box">
            <h4 className="result-box-title">
              ADESSO FATTURI
            </h4>
            <div className="result-box-value-container">
              <p className="result-box-value success">
                {formatCurrency(newRevenue)}
              </p>
            </div>
            <div className="result-box-subtitle-container">
              <p className="result-box-subtitle">
                all'anno
              </p>
            </div>
          </div>
        </div>
        
        {/* Middle Row - Before and After Monthly */}
        <div className="results-grid">
          <div className="result-box">
            <h4 className="result-box-title">
              PRIMA FATTURAVI
            </h4>
            <div className="result-box-value-container">
              <p className="result-box-value">
                {formatCurrency(currentMonthlyRevenue)}
              </p>
            </div>
            <div className="result-box-subtitle-container">
              <p className="result-box-subtitle">
                al mese
              </p>
            </div>
          </div>
          
          <div className="result-box">
            <h4 className="result-box-title">
              ADESSO FATTURI
            </h4>
            <div className="result-box-value-container">
              <p className="result-box-value success">
                {formatCurrency(newMonthlyRevenue)}
              </p>
            </div>
            <div className="result-box-subtitle-container">
              <p className="result-box-subtitle">
                al mese
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Row - Monthly Delta and Percentage */}
        <div className="results-grid">
          <div className="result-box">
            <h4 className="result-box-title">
              QUANTO GUADAGNI IN PIÙ AL MESE
            </h4>
            <div className="result-box-value-container">
              <p className="result-box-value success">
                + {formatCurrency(monthlyDifference)}
              </p>
            </div>
            <div className="result-box-subtitle-container">
              <p className="result-box-subtitle">
                Passando da {formatCurrency(currentMonthlyRevenue)} a {formatCurrency(newMonthlyRevenue)}
              </p>
            </div>
          </div>
          
          <div className="result-box">
            <h4 className="result-box-title">
              AUMENTO PERCENTUALE
            </h4>
            <div className="result-box-value-container">
              <p className="result-box-value success">
                +{percentageDifference}%
              </p>
            </div>
            <div className="result-box-subtitle-container">
              <p className="result-box-subtitle">
                Complimenti!
              </p>
            </div>
          </div>
        </div>
        
        {/* Graph Section */}
        <div className="graph-section">
          <h3 className="graph-title">
            EVOLUZIONE DEL FATTURATO ANNUALE
          </h3>
          
          <div className="graph-container">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart 
                data={prepareChartData()} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="year"
                  tick={{ fill: '#333333', fontFamily: 'Barlow Condensed', fontWeight: 600 }}
                />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('it-IT', { 
                    style: 'currency', 
                    currency: 'EUR',
                    notation: 'compact',
                    maximumFractionDigits: 0 
                  }).format(value)}
                  tick={{ fill: '#333333', fontFamily: 'Hanken Grotesk' }}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                />
                <Legend 
                  wrapperStyle={{ 
                    fontFamily: 'Barlow Condensed',
                    fontWeight: 600
                  }}
                  formatter={(value, entry) => {
                    const color = value === "Nuova Strategia" ? "#19FF24" : "#6B7280";
                    return <span style={{ color: color }}>{value}</span>;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vecchiaStrategia" 
                  name="Vecchia Strategia" 
                  stroke="#6B7280" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="nuovaStrategia" 
                  name="Nuova Strategia" 
                  stroke="#19FF24" 
                  strokeWidth={2}
                  activeDot={{ r: 8, fill: "#00FFFF", stroke: "#19FF24" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Long Term Impact Boxes */}
        <div className="long-term-grid">
          {comparisons.length > 1 && (
            <div className="long-term-box">
              <h4 className="long-term-title">
                QUANTO GUADAGNI IN<br/>PIÙ DOPO 2 ANNI
              </h4>
              <div className="long-term-value-container">
                <p className="long-term-value">
                  +{formatCurrency(comparisons[1].cumulativeDifference)}
                </p>
              </div>
            </div>
          )}
          
          {comparisons.length > 2 && (
            <div className="long-term-box">
              <h4 className="long-term-title">
                QUANTO GUADAGNI IN<br/>PIÙ DOPO 3 ANNI
              </h4>
              <div className="long-term-value-container">
                <p className="long-term-value">
                  +{formatCurrency(comparisons[2].cumulativeDifference)}
                </p>
              </div>
            </div>
          )}
          
          {comparisons.length > 3 && (
            <div className="long-term-box">
              <h4 className="long-term-title">
                QUANTO GUADAGNI IN<br/>PIÙ DOPO 4 ANNI
              </h4>
              <div className="long-term-value-container">
                <p className="long-term-value">
                  +{formatCurrency(comparisons[3].cumulativeDifference)}
                </p>
              </div>
            </div>
          )}
          
          {comparisons.length > 4 && (
            <div className="long-term-box">
              <h4 className="long-term-title">
                QUANTO GUADAGNI IN<br/>PIÙ DOPO 5 ANNI
              </h4>
              <div className="long-term-value-container">
                <p className="long-term-value">
                  +{formatCurrency(comparisons[4].cumulativeDifference)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="cta-container">
        <h2 className="cta-title">
          Sei pronto a trasformare il tuo business con il pricing del conquistatore?
        </h2>
        <p className="cta-description">
          Questo simulatore ti ha mostrato solo un'anteprima dell'impatto che una strategia di pricing può avere sulla tua carriera.
        </p>
        <a href="https://www.darioalbini.com/corso-il-pricing-del-conquistatore/#calcolatore" className="cta-button">
          SCOPRI IL CORSO ABC PRICING
        </a>
        <p className="cta-summary">
          Investire nella tua strategia di pricing oggi potrebbe valere 
          <span className="highlight-value"> {formatCurrency(comparisons.length > 0 ? comparisons[4]?.cumulativeDifference || 0 : 0)}</span>
          {" "}nei prossimi cinque anni!
        </p>
      </div>
    </div>
  );
};

export default FreelancerPriceSimulator;