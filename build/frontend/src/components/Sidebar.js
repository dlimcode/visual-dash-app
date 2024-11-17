import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Tooltip,
  alpha,
  useTheme,
  Divider
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Public as GlobalIcon,
  MusicNote as MusicIcon,
  Psychology as MentalHealthIcon,
  Groups as DemographicsIcon,
  LocationCity as SingaporeIcon,
  ExpandLess,
  ExpandMore,
  Analytics as AnalyticsIcon,
  Compare as CompareIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [expandedMenus, setExpandedMenus] = useState({
    analysis: false,
    insights: false
  });

  const handleMenuExpand = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isSelected = (path) => location.pathname === path;

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      title: 'Global Analysis',
      icon: <GlobalIcon />,
      path: '/global',
    },
    {
      title: 'Music & Happiness',
      icon: <MusicIcon />,
      path: '/music-happiness',
    },
    {
      title: 'Mental Health',
      icon: <MentalHealthIcon />,
      path: '/mental-health',
    },
    {
      title: 'Demographics',
      icon: <DemographicsIcon />,
      path: '/demographics',
    },
    {
      title: 'Singapore Focus',
      icon: <SingaporeIcon />,
      path: '/singapore',
    }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? { xs: '100%', lg: 280 } : 72,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: isOpen ? { xs: '100%', lg: 280 } : 72,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          backgroundColor: 'primary.dark',
          color: 'white',
          borderRight: 'none',
          boxShadow: '4px 0 8px rgba(0, 0, 0, 0.1)',
          height: '100%',
          position: 'fixed',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          p: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {isOpen && (
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Music & Well-being
          </Typography>
        )}
        <IconButton
          onClick={toggleSidebar}
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={isSelected(item.path)}
            onClick={() => navigate(item.path)}
            sx={{
              minHeight: 48,
              justifyContent: isOpen ? 'initial' : 'center',
              px: 2.5,
              mb: 1,
              borderRadius: '12px',
              '&.Mui-selected': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <Tooltip title={!isOpen ? item.title : ''} placement="right">
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isOpen ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                {item.icon}
              </ListItemIcon>
            </Tooltip>
            {isOpen && (
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: isSelected(item.path) ? 600 : 400,
                }}
              />
            )}
          </ListItemButton>
        ))}
      </List>

      {/* Analysis Tools Section */}
      {isOpen && (
        <>
          <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <List sx={{ px: 1 }}>
            <ListItemButton
              onClick={() => handleMenuExpand('analysis')}
              sx={{ borderRadius: '12px' }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                <AnalyticsIcon />
              </ListItemIcon>
              <ListItemText primary="Analysis Tools" />
              {expandedMenus.analysis ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={expandedMenus.analysis} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* Add analysis tool items here */}
              </List>
            </Collapse>
          </List>
        </>
      )}
    </Drawer>
  );
};

export default Sidebar;
